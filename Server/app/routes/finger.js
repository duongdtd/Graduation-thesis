const express = require('express')
const router = express.Router()
const Finger = require('../models/Finger')
const verifyToken = require('../middleware/auth')
// #route 
// POST
router.post('/addfinger',verifyToken,async(req,res) =>{
    const{fingerId,name} =req.body
    if(!fingerId || !name)
    {
        return res
        .status(400)
        .json({success: false, message: "Data is required"})
    }
    try {
        const finger = await Finger.findOne({
            fingerId:fingerId
          })
          if (finger) {
            return res.status(200).json({
              success: false,
              message: 'FingerID has already existed!',
            })
          }
        const newFinger = new Finger({fingerId,name,user : req.userId})
        await newFinger.save()
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
router.get('/',verifyToken, async(req,res) => {
    try {
        const fingers = await Finger.find({user: req.userId}).populate('user',['username'])
        res.json({success:true, fingers})
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
          })
    }
})
//DELETE
router.delete('/:id', verifyToken, async (req, res) => {
	try {
		const fingerDeleteCondition = { _id: req.params.id, user: req.userId }
		const deletedFinger = await Finger.findOneAndDelete(fingerDeleteCondition)

		// User not authorised or post not found
		if (!deletedFinger)
			return res.status(401).json({
				success: false,
				message: 'Post not found or user not authorised'
			})

		res.json({ success: true, post: deletedFinger, message: 'Success' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ success: false, message: 'Internal server error' })
	}
})

module.exports = router