// REQUIRES ==============================================================
const { reservationServices, mailerServices } = require('../services')
const { UPDATED_TICKET, CONFIRM_TICKET, CANCEL_TICKET } = require('../constants/template.constants')
const { RESERVATION, PAYMENT } = require('../constants/app.constants')
const { pdfBuilder } = require('../utils/pdf')
const { generateQRCode } = require('../utils/qrcode')
// CONTROLLERS ============================================================

/**
 * Send Reservation Confirmation Mail
 * @param {*} req
 * @param {*} res
 */
const sendReservationMail = async (req, res) => {
  const { checkoutId } = req.params
  // const language = 'en'
  try {
    // cancellationFlag: To send mail for parking cancellation
    let cancellationFlag = false
    const reservation = await reservationServices.getReservation({ checkoutId })
    const reservationDetails = reservation?.[0]
    const language = reservationDetails.language || 'en'
    if (reservationDetails?.checkoutId) {
      if (reservationDetails?.paymentStatus === PAYMENT.STATUS.SUCCESS) {
        const ticketsToBeConsider = []
        const files = []
        const mailData = {
          subject: '',
          to: reservationDetails?.customer?.email,
          html: '',
          // text: 'Thanks for purchasing the tickets.',
          files,
        }

        for (let i = 0; i < reservationDetails.tickets.length; i++) {
          // create pdf for ticket
          let ticket = reservationDetails.tickets[i]
          if (!ticket.mailSent && ticket.ticketStatus === RESERVATION.TICKETSTATUS.CONFIRMED) {
            mailData.subject = reservationDetails?.confirmationMailsent
              ? UPDATED_TICKET.subject[language || 'en']
              : CONFIRM_TICKET.subject[language || 'en']
            mailData.html = reservationDetails?.confirmationMailsent
              ? UPDATED_TICKET.template[language || 'en'].replace(`{{name}}`, reservationDetails?.customer?.name || '')
              : CONFIRM_TICKET.template[language || 'en'].replace(`{{name}}`, reservationDetails?.customer?.name || '')

            const qrCodeFilename = `${ticket.plate?.replace(/ /g, '_')}-${ticket.reservationId}.png`
            const image = await generateQRCode(ticket.qrCode, qrCodeFilename)
            ticketsToBeConsider.push({
              reservationId: ticket.reservationId,
              qrcodeImage: image,
              template: ticket.template,
            })
            const updatedTemplate = ticketsToBeConsider[i].template.replace(
              `{{qrCodeImage}}`,
              ticketsToBeConsider[i].qrcodeImage,
            )
            await reservationServices.updateTicket(ticketsToBeConsider[i].reservationId, {
              qrCodeImage: ticketsToBeConsider[i].qrcodeImage,
              template: updatedTemplate,
            })

            const filename = `${ticket.plate?.replace(/ /g, '_')}-${ticket.reservationId}.pdf`
            const pdf =
              // item.templateString &&
              await pdfBuilder({
                html: ticket?.template?.replace(`{{qrCodeImage}}`, image) || `Something went wrong`,
                path: 'tickets',
                filename,
              })

            if (!pdf) {
              res.status(500).json({ error: 'problems sending ticket mail', data: null })
              return
            }
            files.push({ filename, path: `./tickets/${filename}` })
          } else if (!ticket.mailSent && ticket.ticketStatus === RESERVATION.TICKETSTATUS.CANCELED) {
            // For cancel parking
            cancellationFlag = true
            mailData.subject = CANCEL_TICKET.subject[language || 'en']
            mailData.html = CANCEL_TICKET.template[language || 'en']
              .replace(`{{name}}`, reservationDetails?.customer?.name || '')
              .replace(`{{reservationId}}`, ticket?.reservationId || '')

            ticketsToBeConsider.push({
              reservationId: ticket.reservationId,
            })
          }
        }

        // files.length: To send mail for parking confirmation and update
        // cancellationFlag: To send mail for parking cancellation
        if (files.length || cancellationFlag) {
          const sendMail = await mailerServices.sendEmail(mailData)
          if (sendMail.data) {
            for (let j = 0; j < ticketsToBeConsider.length; j++) {
              await reservationServices.updateTicket(ticketsToBeConsider[j].reservationId, {
                mailSent: true,
              })
              if (!reservationDetails?.confirmationMailsent) {
                await reservationServices.updateReservation(
                  { checkoutId },
                  { $set: { confirmationMailsent: new Date() } },
                )
              }
            }
          }
          res.json({
            data: sendMail,
            error: null,
          })
        } else {
          res.json({
            error: 'Mail already Sent',
            data: null,
          })
        }
      } else {
        res.json({
          error: 'Payment Pending',
          data: null,
        })
      }
    } else {
      res.json({
        error: 'No Checkout found',
        data: null,
      })
    }
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}

// EXPORTS ================================================================
module.exports = {
  sendReservationMail,
}
