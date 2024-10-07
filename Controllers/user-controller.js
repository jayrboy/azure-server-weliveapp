import User from '../Models/User.js'
import { nanoid } from 'nanoid'

export const checkUser = (req, res) => {
  // console.log('currentUser', req.user)

  User.findOne({ username: req.user.username })
    .select('-password')
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'User not found' })
      }
      res.send(user)
    })
    .catch((err) => res.status(500).send('Server Error'))
}

export const getAll = (req, res) => {
  User.find()
    .select('-password')
    .exec()
    .then((docs) => {
      //   console.log(docs)
      res.json(docs)
    })
}

export const getById = (req, res) => {
  let { id } = req.params
  // console.log(id)

  User.findById(id)
    .select('-password')
    .exec()
    .then((doc) => {
      //   console.log(docs)
      res.json(doc)
    })
}

export const updateRole = async (req, res) => {
  // console.log(req.body)
  const newRole = req.body.data
  await User.findByIdAndUpdate(newRole.id, newRole, { new: true })
    .select('-password')
    .exec()
    .then((docs) => {
      // console.log(docs)
      res.json(docs)
    })
    .catch((err) => console.log(err))
}

export const createBankAccount = (req, res) => {
  // console.log('Body :', req.body)
  // console.log('Query :', req.query.username)

  let form = req.body

  let data = {
    id: nanoid(),
    bankID: form.bankID || '',
    bank: form.bank || '',
    bankName: form.bankName || '',
    promptPay: form.promptPay || '',
    qrCode: form.qrCode || '',
    isActive: false,
  }
  // console.log('Data :', data)

  User.findOneAndUpdate(
    { username: req.query.username },
    { $push: { bank_account: data } },
    { useFindAndModify: false }
  )
    .exec()
    .then(() => res.status(200).json(true))
}

export const updateBankAccount = (req, res) => {
  // console.log('Body :', req.body.bank_account)
  // console.log('Query :', req.query.username)

  let data = {
    bank_account: req.body.bank_account,
  }

  User.findOneAndUpdate({ username: req.query.username }, data, {
    useFindAndModify: false,
  })
    .exec()
    .then(() => res.status(200).json(true))
}

export const getBankAccount = (req, res) => {
  try {
    let id = req.params.id

    User.findById(id)
      .select('-password')
      .exec()
      .then((doc) => res.status(200).json(doc.bank_account))
  } catch (error) {
    res.status(500).json({ message: error })
  }
}
