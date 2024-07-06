import User from '../Models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const generateToken = async (req, res) => {
  try {
    // Generate token
    const payload = {
      success: true,
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (error, token) => {
        if (error) throw error
        res.status(200).json({ token, payload })
      }
    )
  } catch (error) {
    res.status(500).send({ message: error.message, success: false })
  }
}

export const register = async (req, res) => {
  try {
    let { username, password } = req.body
    let user = await User.findOne({ username })

    if (user) {
      return res.status(400).send('User Already Exists!')
    } else {
      // encrypt
      const salt = await bcrypt.genSalt(10)
      password = await bcrypt.hash(password, salt)

      user = new User({
        username,
        password,
      })

      await user.save()
      res.status(200).send('Register Successfully')
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    let username = req.body.username || ''
    let password = req.body.password || ''

    // Check if the user exists
    let user = await User.findOneAndUpdate(
      { username },
      { useFindAndModify: false }
    )
    if (!user) {
      return res.status(404).send('User Not Found!!!')
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).send('Password Invalid!!!')
    }

    // Generate token
    const payload = {
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (error, token) => {
        if (error) throw error
        if (req.body.save) {
          let age = 60 * 60 * 1000 * 24 * 30 // 30 day
          res.cookie('username', username, { maxAge: age })
          res.cookie('password', password, { maxAge: age })
          let save = req.body.save
          res.cookie('save', save, { maxAge: age })
          console.log('Saved to Cookies')

          // ถ้าไม่ได้เลือกบันทึกข้อมูล แต่อาจมีข้อมูลเดิมเก็บเอาไว้
          // ดังนั้น เราอาจลบข้อมูลเหล่านั้นออกไป (ถึงไม่มีก็ไม่เกิด Error)
        } else {
          res.clearCookie('username')
          res.clearCookie('password')
          res.clearCookie('save')
          console.log('Not stored in cookies')
        }
        res.json({ token, payload })
      }
    )
  } catch (error) {
    console.log({ message: error })
    res.status(500).send('Internal Server Error')
  }
}

// export const loginFB = async (req, res) => {
//   try {
//     const { userID, name, email, picture } = req.body
//     let userData = {
//       username: userID,
//       name: name,
//       email: email,
//       picture: picture,
//     }

//     let user = await User.findOneAndUpdate({ username: userID }, { new: true })
//     if (user) {
//       console.log('User updated')
//     } else {
//       console.log('User saved:')
//       user = new User(userData)
//       await user.save()
//     }

//     let payload = {
//       user,
//     }

//     // generate toke
//     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
//         if (err) throw err
//       res.json({ token, payload })
//     })
//   } catch (err) {
//     console.log(err)
//     res.json({ token, payload })
//   }
// }

export const getCookies = (req, res) => {
  let u = req.cookies['username'] || ''
  let p = req.cookies['password'] || ''
  let s = req.cookies['save'] ? true : false
  res.json({ username: u, password: p, save: s })
}
