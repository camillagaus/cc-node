const express = require('express')

const planetsRouter = require('./planets/planets.router')
const launchesRouter = require('./launches/launches.router')
const rocketsRouter = require('./rockets/rockets.router')

const api = express.Router()

api.use('/planets', planetsRouter)
api.use('/launches', launchesRouter)
api.use('/rockets', rocketsRouter)

module.exports = api
