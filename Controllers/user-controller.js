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
  const { id } = req.params
  let form = req.body
  let data = {
    id: nanoid(),
    bankID: form.bankID || '',
    bank: form.bank || '',
    bankName: form.bankName || '',
    promptPay: form.promptPay || '',
  }
  // console.log('ID :', id)
  // console.log('Data :', data)

  User.findByIdAndUpdate(
    id,
    { $push: { bank_account: data } },
    { useFindAndModify: false }
  )
    .select('-password')
    .exec()
    .then(() => {
      User.findById(id).then((docs) => {
        //   console.log(docs)
        res.json(docs)
      })
    })
}

export const updateUser = (req, res) => {
  let form = req.body
  let data = {
    username: form.username,
    name: form.name,
    role: form.role,
    picture: form.picture,
    pages: form.pages,
    bank_account: form.bank_account,
  }

  User.findByIdAndUpdate(form._id, data, { useFindAndModify: false })
    .select('-password')
    .exec()
    .then(() => {
      User.findById(form._id).then((docs) => {
        //   console.log(docs)
        res.json(docs)
      })
    })
}
