import User from '../Models/User.js'

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
