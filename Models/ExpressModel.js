import mongoose from 'mongoose'

let expressSchema = new mongoose.Schema(
  {
    exname: String,
    fprice: Number,
    sprice: Number,
    maxprice: Number,
    whenfprice: Number,
    date_start: Date,
  },
  { timestamps: true }
)

let ExpressModel = mongoose.model('ExpressModel', expressSchema)

export default ExpressModel
