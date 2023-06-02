const mongoose = require('mongoose')

const rocketsSchema = new mongoose.Schema({
  rocket: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('rocket', rocketsSchema)
