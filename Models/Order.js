import mongoose from 'mongoose'

let orderSchema = new mongoose.Schema(
  {
    idFb: String,
    nameFb: String,
    name: String,
    email: String,
    picture_profile: Array,
    orders: Array,
    picture_payment: String,
    address: String,
    sub_district: String, // ตำบล/แขวง
    sub_area: String, // อำเภอ/เขต
    district: String, // จังหวัด
    postcode: String,
    tel: String,
    date_added: Date,
    complete: Boolean,
    sended: Boolean,
    express: String,
    isPayment: Boolean,
    isDelete: Boolean,
  },
  { timestamps: true }
)

let Order = mongoose.model('Order', orderSchema)

export default Order
