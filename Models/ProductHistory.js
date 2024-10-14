import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2' //สำหรับแบ่งเพจ

let productHistorySchema = new mongoose.Schema(
  {
    product_id: String,
    product_name: String,
    updateBy: String,
    price_old: Number,
    price_new: Number,
    cost_old: Number,
    cost_new: Number,
    remarks: String,
  },
  { timestamps: true }
)

productHistorySchema.plugin(paginate) //สำหรับแบ่งเพจ

let ProductHistory = mongoose.model('ProductHistory', productHistorySchema)

export default ProductHistory
