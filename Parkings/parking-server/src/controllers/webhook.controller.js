// REQUIRES ==============================================================
const { reservationServices } = require('../services')
const { getHobexPaymentStatus } = require('../utils/utils')

// CONTROLLERS ============================================================

/**
 * Check Reservation Status
 * @param {*} req
 * @param {*} res
 */
const hobexWebhookConsumer = async (req, res) => {
  const { payload } = req.body
  try {
    // const status = await hobexServices.checkCheckoutStatus(payload.ndc)
    if (payload.result.code) {
      const { card, threeDSecure, customParameters, buildNumber, ...requiredPaymentResponse } = payload
      const paymentStatus = getHobexPaymentStatus(payload.result.code)
      const reservation = await reservationServices.getReservation({ checkoutId })
      const reservationDetails = reservation?.[0]
      if (paymentStatus && paymentStatus !== '') {
        if (payload.paymentType == 'DB' && reservationDetails?.paymentStatus !== 'success') {
          const result = await reservationServices.updateReservation(
            { checkoutId: payload.ndc },
            {
              $set: {
                paymentStatus,
                confirmedBy: 'webhook',
                paymentResponse: {
                  referenceId: payload?.resultDetails?.ConnectorTxID1 || '',
                  moreInfo: requiredPaymentResponse,
                },
              },
              $push: {
                transactions: {
                  createdAt: new Date(),
                  amount: payload.amount,
                  description: payload.result.description,
                },
              },
            },
          )
          const checkout = await reservationServices.PaymentStatusProcessorService(payload.ndc, payload)
          res.json({ data: checkout, error: null })
        }
      } else {
        res.status(254).json({ data: null, error: 'Unable to Identify payment status' })
      }
    } else {
      res.status(250).json({
        data: null,
        error: 'No status updates from Hobex',
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
  hobexWebhookConsumer,
}
