const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Notification = new Schema({
  ID: {
    type: Number
  },
  Type: {
    type:String ,
    },
  device_id: {
     type :String,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('notifications', Notification)
