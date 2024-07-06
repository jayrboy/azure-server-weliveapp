import mongoose from 'mongoose'

let dailyStockSchema = new mongoose.Schema(
  {
    status: String,
    chanel: String,
    products: Array,
    price_total: Number,
    date_added: Date,
  },
  { timestamps: true }
)
let DailyStock = mongoose.model('DailyStock', dailyStockSchema)

export default DailyStock
