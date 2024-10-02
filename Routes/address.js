import express from 'express'

import Province from '../Models/Province.js'
import Amphure from '../Models/Amphure.js'
import District from '../Models/District.js'
import Geography from '../Models/Geography.js'
import { body } from 'express-validator'

const router = express.Router()

// http://localhost:8000/api/users

router.get('/province', (req, res) => {
  try {
    Province.find({})
      .exec()
      .then((docs) => res.status(200).json(docs))
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error })
  }
})

router.get('/province/amphure/:id', (req, res) => {
  let id = req.params.id

  Amphure.find({ province_id: id })
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((error) => res.status(500).json({ message: error }))
})

router.get('/district/amphure/:id', (req, res) => {
  let id = req.params.id

  District.find({ amphure_id: id })
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((error) => res.status(500).json({ message: error }))
})

router.get('/geography', (req, res) => {
  Geography.find({})
    .exec()
    .then((docs) => res.json(docs))
})

router.get('/amphure/existing/:amphure', async (req, res) => {
  let amphure = req.params.amphure

  let amphureId = await Amphure.findOne({ name_th: amphure }).exec()
  res.send(amphureId)
})

router.get('/district/existing', async (req, res) => {
  let { district } = req.body

  let districtId = await District.find({ name_th: district }).exec()
  res.send(districtId)
})

export default router
