import LiveVideo from '../Models/LiveVideo.js'

export const createLiveVideo = (req, res) => {
  try {
    let form = req.body
    let data = {
      facebook_id: form.facebook_id || '',
      facebook_name: form.facebook_name || '',
      title: form.title || '',
      status: form.status || 'LIVE',
      embed_html: form.embed_html || '',
      live_video_id: form.live_video_id || '',
      comments: form.comments || [],
      keyword: form.keyword || '',
    }

    LiveVideo.create(data)
      .then((doc) => {
        res.status(200).json(doc)
      })
      .catch((error) => res.status(500).json({ message: error.message }))
  } catch (error) {
    // res.status(400).json(error)
    res.status(400).json(false)
  }
}

export const getAll = async (req, res) => {
  LiveVideo.find({})
    .select('-comments')
    .exec()
    .then((docs) => res.status(200).json(docs))
    .catch((error) => res.status(500).json({ message: error.message }))
}

export const getById = async (req, res) => {
  const { id } = req.params
  LiveVideo.findById(id)
    .exec()
    .then((doc) => res.status(200).json(doc))
    .catch((error) => res.status(500).json({ message: error.message }))
}

export const updateComments = (req, res) => {
  let form = req.body
  let data = {
    comments: form.comments || [],
  }

  LiveVideo.findByIdAndUpdate(form.id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      LiveVideo.findById(form.id)
        .exec()
        .then((doc) => res.status(200).json(doc))
    })
    .catch((error) => res.status(500).json({ message: error.message }))
}

//
export const updateKeyword = (req, res) => {
  let form = req.body
  let data = {
    keyword: form.keyword || '',
  }

  LiveVideo.findByIdAndUpdate(form.id, data, { useFindAndModify: false })
    .exec()
    .then(() => {
      LiveVideo.findById(form.id)
        .exec()
        .then((doc) => res.status(200).json(doc))
    })
    .catch((error) => res.status(500).json({ message: error.message }))
}
