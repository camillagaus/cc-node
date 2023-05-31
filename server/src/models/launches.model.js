const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')
const axios = require('axios')

const DEFAULT_FLIGHT_NUMBER = 100

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
  console.log('Downloading launch data...')
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  })

  if (response.status !== 200) {
    console.log('Problem downloadig launch data')
    throw new Error('Launch data download failed')
  }

  const launchDocs = response.data.docs
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads
    const customers = payloads.flatMap((payload) => {
      return payload.customers
    })

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    }
    console.log(launch)
    await saveLaunch(launch)
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  })
  if (firstLaunch) {
    console.log('Launch data already loaded')
  } else {
    await populateLaunches()
  }
}

//When passing in the flight no we will get the whole launch object back
// launches.set(launch.flightNumber, launch)

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  })
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber')

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }
  return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        ' _id': 0,
        // prettier-ignore
        '__v': 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit)
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    // with findOneAndUpdate - will only return the values we expect in our update (launch)
    launch,
    {
      upsert: true,
    }
  )
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  })

  if (!planet) {
    throw new Error('No matching planet found')
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  })
  await saveLaunch(launch)
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  )
  return aborted.modifiedCount === 1
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
}
