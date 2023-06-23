// REQUIRES ===============================================================
const { OtpModel } = require('../models')
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const { sendEmail } = require('./mailer.services')
const { OTP } = require('../constants/template.constants')

// SERVICES ===============================================================

/**
 * Get an otp for a particular reservation
 * @param {String} email
 * @param {Number} reservationId
 * @param {Number} otp
 * @returns
 */
const getOtp = async (email, reservationId, otp, isUsed) => {
  return await OtpModel.findOne({
    reservationId,
    email,
    otp,
    ...(isUsed ? { isUsed } : {}),
  })
}

/**
 * Updated otp isUsed
 * @param {String} email
 * @param {Number} reservationId
 * @returns
 */
const otpIsUsed = async (email, reservationId, otp) => {
  const filter = { email, reservationId, otp }
  const reflection = {
    isUsed: true,
  }
  const options = { upsert: false, returnOriginal: false }
  return await OtpModel.findOneAndUpdate(filter, reflection, options)
}

/**
 * Add otp details
 * @param {String} email
 * @param {Number} reservationId
 * @param {Number} otp
 * @param {Date} expiresIn
 * @returns
 */
const addOtp = async (email, reservationId, otp, expiresIn) => {
  var data = {
    email,
    reservationId,
    otp,
    expiresIn,
  }
  const tokenData = new OtpModel(data)
  return await tokenData.save()
}
/**
 * Generate an otp
 * @param {String} email
 * @param {Number} reservationId
 */
async function generateOtp(email, reservationId) {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  })
  const currDate = new Date()
  const expiresIn = new Date().setMinutes(currDate.getMinutes() + 60)
  const addParkingOtp = await addOtp(email, reservationId, otp, expiresIn)
  return otp
}

async function sendOtpMail(language, otp, { reservationId, email, name }) {
  try {
    const htmlBody = OTP.template[language || 'en']
      .replace('{{otp}}', otp)
      .replace('{{name}}', name)
      .replace('{{reservationId}}', reservationId)
    const subject = OTP.subject[language || 'en']
    const fromMail = 'testphp@mailtest.radixweb.net'
    const mailInfo = await sendEmail({
      // from: '"Prags Parking P4" ' + fromMail + '',
      to: email,
      subject: subject,
      text: 'Hello ' + name,
      html: htmlBody,
    })
    return mailInfo
  } catch (error) {
    console.log('Error', error)
    return {
      code: 400,
      message: error.response,
      field: 'FIELD',
      type: 'TYPE',
    }
  }
}

// EXPORTS ================================================================
module.exports = {
  getOtp,
  otpIsUsed,
  addOtp,
  generateOtp,
  sendOtpMail,
}
