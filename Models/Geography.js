import mongoose from 'mongoose'

let geographySchema = new mongoose.Schema({
  id: String,
  name: String,
})

let Geography = mongoose.model('Geography', geographySchema)

export default Geography
