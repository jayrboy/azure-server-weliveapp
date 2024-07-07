import mongoose from 'mongoose'

let userSchema = mongoose.Schema(
  {
    username: { type: String, required: true }, // USER-ID
    password: String,
    role: { type: String, default: 'user' },
    name: String,
    email: String,
    picture: {
      type: Array,
      default: [{ data: { url: 'no-image.jpg' } }],
    },
    userAccessToken: String,
    pages: { type: Array, default: [] }, // ฟิลด์สำหรับเก็บข้อมูลเพจ
  },
  { timestamps: true }
)
let User = mongoose.model('User', userSchema)

export default User
