import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2' //สำหรับแบ่งเพจ

let productSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    price: Number,
    stock_quantity: Number,
    cost: Number,
    limit: Number,
    cf: Number,
    paid: Number,
    remaining_cf: Number,
    remaining: Number,
    date_added: Date,
  },
  { timestamps: true }
)

productSchema.plugin(paginate) //สำหรับแบ่งเพจ

let Product = mongoose.model('Product', productSchema)

export default Product
