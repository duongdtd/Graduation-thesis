//Server ------------------------------------------------------------- //
const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./app/routes/auth')
const fingerRouter = require('./app/routes/finger')
const notificationRouter = require('./app/routes/notification')
const Notification = require('./app/models/Notification')
require('dotenv').config()
const cors = require('cors')
const baseURL = `https://backend-production-b88c.up.railway.app/api/notification`
// MQTT Broker ------------------------------------------------------ //
var mqtt = require('mqtt')
const axios = require('axios')
const host = 'test.mosquitto.org'
const port = '1883'
const clientId = `RaspberryPiahgsdahgsdahgsd`
const connectOps = {
}
//Push Notification------------------------------------------------------//
var sendNotification = function (data) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };

  var https = require('https');
  var req = https.request(options, function (res) {
    res.on('data', function (data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });

  req.on('error', function (e) {
    console.log("ERROR:");
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
};


// sendNotification(message);
//-------------------------------Start--------------------------------- //

const connectUrl = `mqtt://${host}:${port}`
var client = mqtt.connect(connectUrl, {
  username: 'duong',
  password: '123456',
  clientId,
  connectTimeout: 4000,
  reconnectPeriod: 1000,

})
// on mqtt conect subscribe on tobic test 
client.on('connect', function () {
  client.subscribe('test_ahgsd_dtd_vip_pro_datn', function (err) {
    if (err)
      console.log(err)
  })
  client.publish
})
client.on('message', function (topic, message) {
  // json_check(message)
  if (message.toString() == "969696") {
    let string = `Someone is trying to open the door!`
    var message = {
      app_id: "241418b7-fac3-4a5d-8bf4-0fa45147f723",
      contents: { "en": string },
      headings: { "en": "Notification" },
      include_player_ids: ["f9b489f6-66cd-4e39-8506-0aed4107d9a2"]
    };
    sendNotification(message);
  }
  else {
    let data = message.toString().split("@@")
    console.log(message.toString().split("@@"))
    let data_send = {
      ID: parseInt(data[0], 10),
      Type: data[1],
      device_id: data[2]
    }
    addnotify(data_send)
    let string = `ID :${data_send.ID} open by ${data_send.Type}`
    var message = {
      app_id: "241418b7-fac3-4a5d-8bf4-0fa45147f723",
      contents: { "en": string },
      headings: { "en": "Notification" },
      include_player_ids: ["f9b489f6-66cd-4e39-8506-0aed4107d9a2"]
    };
    sendNotification(message);
  }
})
async function addnotify(data) {
  return await axios({
    method: 'post',
    url: `${baseURL}/addnotify`,
    data,
  });
}
// Config
const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@datn.gp5asdo.mongodb.net/?retryWrites=true&w=majority`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

    })
    console.log("Connected DB")
  }

  catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

connectDB()
const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/auth', authRouter)
app.use('/api/finger', fingerRouter)
app.use('/api/notification', notificationRouter)
app.get('/', (req, res) => res.send("Hello World"))

const PORT = process.env.PORT || 5000

app.get('/open', (req, res) => {
  res.send
  client.publish('test_ahgsd_dtd_vip_pro_datn_sub', 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })

})
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))








