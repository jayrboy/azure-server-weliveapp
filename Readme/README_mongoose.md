# MongoDB Relationships using Mongoose in NodeJS

https://dev.to/alexmercedcoder/mongodb-relationships-using-mongoose-in-nodejs-54cc

## Schema (Model)

รายละเอียดของหนึ่ง Sale Order มีลักษณะข้อมูล ดังนี้

```js
import mongoose from 'mongoose'

let orderSchema = new mongoose.Schema({
  idFb: String,
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
})

let Order = mongoose.model('Order', orderSchema)

export default Order
```

การอ่านข้อมูล - find({})

```js
import Order from '../Models/Order.js'

// query for all sale order
Order.find({})
```

## (1) One-to-One

ข้อมูลความสัมพันธ์แบบ 1:1 ใน หนึ่งออเดอร์ มีลูกค้าได้เพียงคนเดียว เท่านั้น

1. Customer.js

```js
import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    idFb: Number,
    name: String,
    email: String,
    picture: {
      type: Array,
      default: [{ data: { url: 'no-profile.jpg' } }],
    },
  },
  { timestamps: true }
)
const Customer = mongoose.model('Customer', customerSchema)

export default Customer
```

2. Order.js

```js
import mongoose from 'mongoose'
import Customer from '../Models/Customer.js'

const orderSchema = new mongoose.Schema({
  customer: Customer,
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
})
const Order = mongoose.model('Order', orderSchema)

export default Order
```

3. การเพิ่มข้อมูโดยใช้ฟังก์ชัน create() แล้วก็ find({}) อ่านข้อมูลทั้งหมด

```js
import Order from '../Models/Order.js'

// Create a new sale order
Order.create({
  customer: {
    idFb: '123_456',
    name: 'FB Name',
    email: 'example@test.com',
    picture: [],
  },
  orders: [],
  picture_payment: 'PAID-09062024_img.jpg',
  address: '123 House',
  sub_district: 'ทุ่งสองห้อง', // ตำบล/แขวง
  sub_area: 'หลักสี่', // อำเภอ/เขต
  district: 'กรุงเทพ', // จังหวัด
  postcode: '36000',
  tel: '0665675478',
  date_added: '09-06-2024',
  complete: false,
})

// query for all sale orders, will include the nested customer info
Order.find({})
```

## (2) One-to-Many

ปรับโครงสร้างใหม่ เพื่อ จัดการกับลูกค้าเจ้าของออเดอร์ที่ มีออเดอร์หลาย orders ได้
ลูกค้าหนึ่งคน : มีหลายออเดอร์
โดยทั่วไป จะติดตามด้านหนึ่ง เพื่อเข้าถึง ข้อมูลหลายด้าน (เป็นข้อมูล Sale Order ที่จะติดตามลูกค้า)

1. Order.js

```js
import mongoose from 'mongoose'
import Customer from '../Models/Customer.js'

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Types.ObjectId, ref: 'Customer' },
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
})
const Order = mongoose.model('Order', orderSchema)

export default Order
```

2. การเพิ่มข้อมูโดยใช้ฟังก์ชัน create() แล้วก็ find({}) อ่านข้อมูลทั้งหมด

   1 Sale order มี customer ได้เดียวเพียงคนเดียว
   1 customer สามารถมี orders ได้หลายออเดอร์

```js
import Customer from '../Models/Customer.js'
import Order from '../Models/Order.js'

// Create a Customer
const customer = await Customer.create({
  dFb: '123_456',
  name: 'FB Name',
  email: 'example@test.com',
  picture: [],
})

// Create a new sale order
Order.create({
  customer: customer,
  orders: [],
  picture_payment: 'PAID-09062024_img.jpg',
  address: '123 House',
  sub_district: 'ทุ่งสองห้อง', // ตำบล/แขวง
  sub_area: 'หลักสี่', // อำเภอ/เขต
  district: 'กรุงเทพ', // จังหวัด
  postcode: '36000',
  tel: '0665675478',
  date_added: '09-06-2024',
  complete: false,
})

// query for all sale orders,  use populate to include customer info
Order.find({}).populate('customer')
```

## (3) Many-to-Many

1. customer ได้หลายคน สามารถมีได้หลายออเดอร์

```js
import mongoose from 'mongoose'

const orderSchema = {
  customer: { type: mongoose.Types.ObjectId, ref: 'Customer' },
  orders: [{ type: mongoose.Types.ObjectId, ref: 'Product' }],
}
const Order = mongoose.model('Order', orderSchema)

export default Order
```

2. การเพิ่มข้อมูโดยใช้ฟังก์ชัน create() แล้วก็ find({}) อ่านข้อมูลทั้งหมด

```js
import Customer from '../Models/Customer.js'
import Order from '../Models/Order.js'
import CustomerOrder from '../Models/CustomerOrder.js'

// Create a Customer
const customer = await Customer.create({
  dFb: '123_456',
  name: 'FB Name',
  email: 'example@test.com',
  picture: [],
})

// Create a new sale order
const order = await Order.create({
  customer: customer,
  orders: [],
  picture_payment: 'PAID-09062024_img.jpg',
  address: '123 House',
  sub_district: 'ทุ่งสองห้อง', // ตำบล/แขวง
  sub_area: 'หลักสี่', // อำเภอ/เขต
  district: 'กรุงเทพ', // จังหวัด
  postcode: '36000',
  tel: '0665675478',
  date_added: '09-06-2024',
  complete: false,
})

// Create record that the owner owns the house
CustomerOrder.create({ customer: customer, orders: order })

// Query หาทุก Order ที่ customer นี้สั่ง
CustomerOrder.find({ customer: customer }).populate('orders')

// Query หาทุก Customer ที่สั่ง order นี้
CustomerOrder.find({ orders: order }).populate('customer')
```

# ข้อสรุป

Hopefully this helps in implementing relationships in my application.
