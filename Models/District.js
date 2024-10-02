import mongoose from 'mongoose'

let districtSchema = new mongoose.Schema({
  id: String,
  code: String,
  name_th: String,
  name_en: String,
  amphure_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Amphure' },
})

let District = mongoose.model('District', districtSchema)

export default District
