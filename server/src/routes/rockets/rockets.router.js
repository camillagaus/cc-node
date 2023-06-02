const express = require('express')
const {
  httpGetAllRockets,
  httpAddNewRocket,
  httpGetSingleRockets,
} = require('./rockets.controller')

const rocketsRouter = express.Router()

rocketsRouter.get('/', httpGetAllRockets)
rocketsRouter.get('/:id', httpGetSingleRockets)
rocketsRouter.post('/', httpAddNewRocket)

module.exports = rocketsRouter
