const qrcode = require('qrcode')
const path = require('path')
const { domain } = require('../config')

async function generateQRCode(url, filename) {
  try {
    // Generate QR code image
    const qrCodeOptions = {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.92,
      margin: 1,
    }
    const imagePath = path.join('./', 'qrcodes', filename)

    await qrcode.toFile(imagePath, url, qrCodeOptions)

    // Return the URL of the saved image
    const imageUrl = `${domain}/${filename}` // Replace with your server's domain and path
    return imageUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

module.exports = {
  generateQRCode,
}
