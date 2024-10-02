import mongoose from 'mongoose'

let amphureSchema = new mongoose.Schema({
  id: String,
  code: String,
  name_th: String,
  name_en: String,
  province_id: String,
})

let Amphure = mongoose.model('Amphure', amphureSchema)

export default Amphure
