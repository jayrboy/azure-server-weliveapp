import mongoose from 'mongoose'

let amphureSchema = new mongoose.Schema({
  id: String,
  code: String,
  name_th: String,
  name_en: String,
  province_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
})

let Amphure = mongoose.model('Amphure', amphureSchema)

export default Amphure
