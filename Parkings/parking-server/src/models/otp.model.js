const { Schema, model } = require('mongoose')

const otpSchema = new Schema(
    {
      reservationId: {
        type: Number,
        require: true,
      },
      email: {
        type: String,
        require: true,
      },
      otp: {
        type: Number,
        require: true,
      },
      expiresIn: {
        type: Date,
        require: true,
      },
      isUsed: {
        type: Boolean,
        default: false
      }
    },
    { timestamps: true, versionKey: false, collection: "parkingOtp" }
  );

  const OtpModel = model('parkingOtp', otpSchema)

  module.exports = OtpModel
