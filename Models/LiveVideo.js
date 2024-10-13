import mongoose from 'mongoose'

let liveVideoSchema = new mongoose.Schema(
  {
    facebook_id: String,
    facebook_name: String,
    title: String,
    status: String,
    embed_html: String,
    live_video_id: String,
    comments: Array,
    keyword: String,
  },
  { timestamps: true }
)

let LiveVideo = mongoose.model('LiveVideo', liveVideoSchema)

export default LiveVideo
