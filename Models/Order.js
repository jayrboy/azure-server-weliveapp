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
    district: String, // ตำบล/แขวง
    amphure: String, // อำเภอ/เขต
    province: String, // จังหวัด
    postcode: String,
    tel: String,
    date_added: Date,
    complete: Boolean,
    sended: Boolean,
    express: String,
    isPayment: Boolean,
    isDelete: Boolean,
    vendorId: String,
    updateBy: String,
    psidFb: String,
    isRestore: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

let Order = mongoose.model('Order', orderSchema)

export default Order
