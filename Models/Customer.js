import mongoose from 'mongoose'

let customerSchema = new mongoose.Schema(
  {
    idFb: Number,
    name: String,
    email: String,
    picture: {
      type: Array,
      default: [{ data: { url: 'no-profile.jpg' } }],
    },
  },
  { timestamps: true }
)

let Customer = mongoose.model('Customer', customerSchema)

export default Customer
