import Customer from '../Models/Customer.js'

export const getAll = async (req, res) => {
  let customers = await Customer.find({}).exec()

  if (!customers) {
    res.status(404).json({ message: 'Customers not existing' })
  }

  res.status(200).send(customers)
}

export const getById = async (req, res) => {
  let id = req.params.id
  let customer = await Customer.findById(id).exec()

  if (!customer) {
    res.status(404).json({ message: 'Customer not existing' })
  }

  res.status(200).send(customer)
}

export const updateById = async (req, res) => {
  let form = req.body
  let data = {
    idFb: form.idFb,
    nameFb: form.nameFb,
    name: form.name,
    email: form.email,
    picture: form.picture,
  }

  let updateCustomerExisting = await Customer.findByIdAndUpdate(
    form._id,
    data,
    {
      useFindAndModify: false,
    }
  ).exec()

  if (!updateCustomerExisting) {
    res.status(404).json({ message: 'Customer not existing' })
  }

  let customerExisting = await Customer.findById(
    updateCustomerExisting._id
  ).exec()

  res.status(200).send(customerExisting)
}
