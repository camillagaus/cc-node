const rockets = require('./rockets.mongo')
const launches = require('./launches.mongo')
const axios = require('axios')

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateRockets() {
  console.log('downloading rocket data...')
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
      ],
    },
  })

  const rocketDocs = response.data.docs

  for (const rocketDoc of rocketDocs) {
    const rocket = {
      rocket: rocketDoc.rocket.name,
    }
    console.log(rocket)

    await saveRocket(rocket)
  }
  console.log('done')
}

async function loadRocketsData() {
  const firstRocket = await findRocket({
    rocket: 'Falcon 1',
  })
  if (firstRocket) {
    console.log('Rocket data already loaded')
  } else {
    await populateRockets()
  }
}

async function findRocket(rocket) {
  return await rockets.findOne(rocket)
}

async function getAllRockets() {
  return await rockets.find(
    {},
    {
      // prettier-ignore
      ' _id': 0,
      // prettier-ignore
      '__v': 0,
    }
  )
}

async function getSingleRocket(rocketId) {
  console.log('rocketId', rocketId)
  return await rockets.findById({ _id: rocketId })
}

async function saveRocket(rocket) {
  await rockets.create({ rocket: rocket.rocket })
}

async function addNewRocket(rocket) {
  await saveRocket(rocket)
}

// async function existsRocketWithId(rocketId) {
//   return await findRocket(rocketId)
// }

module.exports = {
  getAllRockets,
  addNewRocket,
  loadRocketsData,
  getSingleRocket,
  //   existsRocketWithId,
}
