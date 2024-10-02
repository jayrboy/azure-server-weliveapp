import mongoose from 'mongoose'

let provinceSchema = new mongoose.Schema({
  id: String,
  code: String,
  name_th: String,
  name_en: String,
  geography_id: String,
})

let Province = mongoose.model('Province', provinceSchema)

export default Province
