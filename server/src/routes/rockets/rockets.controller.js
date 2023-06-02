const {
  getAllRockets,
  addNewRocket,
  getSingleRocket,
  existsRocketWithId,
} = require('../../models/rockets.model')

async function httpGetAllRockets(req, res) {
  return res.status(200).json(await getAllRockets())
}

async function httpAddNewRocket(req, res) {
  const rocket = req.body
  console.log('req', rocket)

  await addNewRocket(rocket)
  return res.status(201).json(rocket)
}

async function httpGetSingleRockets(req, res) {
  const rocketId = req.params.id
  console.log('httpgetsingle', rocketId)

  // const existsRocket = await existsRocketWithId(rocketId)

  // if (!existsRocket) {
  //   return res.status(404).json({
  //     error: 'Not found',
  //   })
  // }
  return res.status(200).json(await getSingleRocket(rocketId))
}

module.exports = {
  httpGetAllRockets,
  httpAddNewRocket,
  httpGetSingleRockets,
}
