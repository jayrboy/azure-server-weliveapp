import mongoose from 'mongoose'

let userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    password: String,
    role: { type: String, default: 'user' },
    name: String,
    email: String,
    picture: {
      type: Array,
      default: [{ data: { url: 'no-image.jpg' } }],
    },
  },
  { timestamps: true }
)
let User = mongoose.model('User', userSchema)

export default User
