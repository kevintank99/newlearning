// REQUIRES ===============================================================
const nodemailer = require('nodemailer')
const { mail } = require('../config')
// SERVICES ===============================================================

/**
 * Send Email
 * @param {{from: string, to: string, subject: string, text: string, html: string, files: *}} mailOptions
 * @returns {{data: *, error: *}} mailDetails
 */
const sendEmail = async ({ from, to, subject, text, html, files }) => {
  try {
    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: true, // Set to true if using a secure connection (TLS/SSL)
      auth: {
        user: mail.user,
        pass: mail.password,
      },
    })

    // Prepare the email message
    const mailOptions = {
      from: from || mail.from,
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: files, // Array of attachment objects, each containing filename and path
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)
    return { data: info, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}


// EXPORTS ================================================================
module.exports = {
  sendEmail,
}
