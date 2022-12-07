const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
// #route 
// POST
router.post('/addnotify',async(req,res) =>{
    const{ID,Type,device_id} =req.body
    if(!ID || !Type || !device_id)
    {
        return res
        .status(400)
        .json({success: false, message: "Data is requidsred ~~`"})
    }
    try {
        const newNotification = new Notification({ID,Type,device_id})
        await newNotification.save()
        res.json({success :true, message:"Success"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        })
    }
})

//GET
router.post('/',async(req,res) => {
    try {
        const notifications = await Notification.find(req.body)
        res.json({success:true, notifications})
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
          })
    }
})
module.exports = router