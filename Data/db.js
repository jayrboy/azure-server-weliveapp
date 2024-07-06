import 'dotenv/config'
import mongoose from 'mongoose'

//TODO: Add Connection Strings for Default --> .connect('mongodb://localhost/mydatabase')

const connectDB = () =>
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB Connected!'))
    .catch((e) => console.log({ message: 'Failed connection: ' + e }))

export default connectDB
