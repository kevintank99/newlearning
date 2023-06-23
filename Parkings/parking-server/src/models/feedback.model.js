const { Schema, model } = require('mongoose')

const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false, collection: 'parkingFeedback' },
)

const parkingFeedback = model('parkingFeedback', feedbackSchema)

module.exports = parkingFeedback
