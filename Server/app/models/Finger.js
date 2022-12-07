const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Finger = new Schema({
  fingerId :Number,
  name:String,
  user :{
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('fingers', Finger)
