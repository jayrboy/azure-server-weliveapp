import mongoose from 'mongoose'

let customerSchema = new mongoose.Schema(
  {
    idFb: String,
    nameFb: String,
    name: String,
    email: String,
    picture: {
      type: Array,
      default: [{ data: { url: 'no-profile.jpg' } }],
    },
    psidFb: String,
  },
  { timestamps: true }
)

let Customer = mongoose.model('Customer', customerSchema)

export default Customer
