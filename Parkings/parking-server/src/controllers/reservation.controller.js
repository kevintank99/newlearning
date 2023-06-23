// REQUIRES ==============================================================
const fetch = require('node-fetch')
const {
  reservationServices,
  hobexServices,
  bftServices,
  otpServices,
  mailerServices,
  ratesServices,
} = require('../services')
const {
  DateConvertor,
  genrateRandomCode,
  getHobexPaymentStatus,
  addDays,
  priceConvertor,
  addGapSlots,
} = require('../utils/utils')
const { client, domain } = require('../config')
const { RESERVATION, PAYMENT } = require('../constants/app.constants')
const { UPDATED_TICKET } = require('../constants/template.constants')
// CONTROLLERS ============================================================

/**
 * Get Reservations
 * @param {*} req
 * @param {*} res
 */
const getReservations = async (req, res) => {
  try {
    const result = await reservationServices.getReservation({})
    res.json({ data: result, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get a particular ticket from reservations
 * @param {*} req
 * @param {*} res
 */
const getReservation = async (req, res) => {
  try {
    const { email, reservationId, language } = req.query
    const tickets = await reservationServices.getReservation(
      {
        'tickets.reservationId': parseInt(reservationId),
        'customer.email': email,
      },
      { 'tickets.$': 1, _id: 0, customer: 1 },
    )

    if (tickets && tickets.length > 0) {
      const ticketDetails = tickets[0]

      const ticketDate = new Date(ticketDetails.tickets[0].arrival)

      if (ticketDetails.tickets[0].ticketStatus === RESERVATION.TICKETSTATUS.CONFIRMED) {
        if (ticketDate >= new Date()) {
          const otpDetails = await otpServices.getOtp(email, reservationId)
          if (otpDetails) {
            const resOtpMail = await otpServices.sendOtpMail(language, otpDetails.otp, {
              reservationId,
              email,
              name: ticketDetails.customer.name,
            })
            res.status(270).json({ data: 'Otp sent successfully', error: null })
          } else {
            const otp = await otpServices.generateOtp(email, reservationId)
            const resOtpMail = await otpServices.sendOtpMail(language, otp, {
              reservationId,
              email,
              name: ticketDetails.customer.name,
            })

            res.status(270).json({ data: 'Otp sent successfully', error: null })
          }
        } else {
          res.status(255).json({
            data: null,
            error: `Sorry, we cannot manage the old ticket.`,
          })
        }
      } else {
        res.status(256).json({
          data: null,
          error: `Sorry, we cannot manage the canceled ticket.`,
        })
      }
    } else {
      res.status(250).json({ data: null, error: 'Ticket not found' })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get Reservations
 * @param {*} req
 * @param {*} res
 */
const otpVerification = async (req, res) => {
  try {
    const { email, reservationId, otp } = req.body
    const otpDetails = await otpServices.getOtp(email, reservationId, otp)
    const currentDate = new Date()

    if (otpDetails) {
      if (!otpDetails.isUsed) {
        if (otpDetails.expiresIn > currentDate) {
          const otpUsed = await otpServices.otpIsUsed(email, reservationId, otp)
          if (otpUsed) {
            const tickets = await reservationServices.getReservation(
              {
                'tickets.reservationId': parseInt(reservationId),
                'customer.email': email,
              },
              { 'tickets.$': 1, _id: 0, customer: 1 },
            )
            const ticketDetails = tickets[0]
            res.json({ data: ticketDetails, error: null })
          }
        } else {
          res.status(257).send({ data: null, error: 'Otp is expired.' })
        }
      } else {
        res.status(256).send({ data: null, error: 'Otp is already used' })
      }
    } else {
      res.status(250).send({ data: null, error: 'Please enter valid Otp' })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get Todays Reservations
 * @param {*} req
 * @param {*} res
 */
const getTodaysReservations = async (req, res) => {
  const { startDate, endDate, vehicleType, parkId } = req.query
  try {
    const result = await reservationServices.getTodaysReservations(startDate, endDate, vehicleType, parkId)
    res.json({ data: result, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get Range based Reservations
 * @param {*} req
 * @param {*} res
 */
const getRangeBasedReservations = async (req, res) => {
  const { startDate, endDate, vehicleType, parkId } = req.query
  try {
    const result = await reservationServices.getRangeBasedReservations(startDate, endDate, vehicleType, parkId)
    res.json({
      data: result,
      error: null,
    })
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}

/**
 * Get Range based Checkout
 * @param {*} req
 * @param {*} res
 */
const getRangeBasedCheckouts = async (req, res) => {
  const { startDate, endDate, vehicleType, parkId } = req.query
  try {
    const result = await reservationServices.getRangeBasedReservations(startDate, endDate, vehicleType, parkId, {
      'tickets.vehicleStatus': RESERVATION.VEHICLESTATUS.CHECKEDOUT,
    })
    res.json({
      data: result,
      error: null,
    })
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}

/**
 * Check Slot Available
 * @param {*} req
 * @param {*} res
 */
const checkParkingSlotAvailable = async (req, res) => {
  const { arrival, departure, vehicleType, parkId } = req.query
  try {
    const { available } = await reservationServices.getParkingSlotAvailability(arrival, departure, vehicleType, parkId)
    res.json({
      data: { available },
      error: null,
    })
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}

/**
 * Get Availability
 * @param {*} req
 * @param {*} res
 */
const getAvailability = async (req, res) => {
  const { startDate, endDate, vehicleType, parkId } = req.query
  try {
    const result = await reservationServices.getRangeBasedAvailability(startDate, endDate, vehicleType, parkId)
    res.json({
      data: result,
      error: null,
    })
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}
/**
 * Get Calendar data
 * @param {*} req
 * @param {*} res
 */
const getCalendarData = async (req, res) => {
  const { startDate, endDate, vehicleType, parkId } = req.query
  try {
    const priceType = 'daily'
    const availability = await reservationServices.getRangeBasedAvailability(startDate, endDate, vehicleType, parkId)
    const rates = await ratesServices.getRangeBasedRates(startDate, endDate)
    const rangebasedRates = rates.reduce((res, curr) => {
      if (res[curr.vehicleType]) {
        res[curr.vehicleType].push({
          // ...curr,
          prices:
            priceType === 'daily'
              ? priceConvertor(new Date(startDate), new Date(endDate), curr.prices)
              : priceType === 'slot'
              ? addGapSlots(curr.prices)
              : curr.prices,
        })
      } else {
        if (!vehicleType || vehicleType === curr.vehicleType)
          res[curr.vehicleType] = [
            {
              // ...curr,
              prices:
                priceType === 'daily'
                  ? priceConvertor(new Date(startDate), new Date(endDate), curr.prices)
                  : priceType === 'slot'
                  ? addGapSlots(curr.prices)
                  : curr.prices,
            },
          ]
      }

      return res
    }, {})[vehicleType]

    if (rangebasedRates) {
      const gaps = rangebasedRates?.reduce((acc, curr) => {
        curr.prices?.map((price) => {
          if (!price.amount) acc.push(price)
        })
        return acc
      }, [])

      gaps.forEach((item) => {
        if (availability[item.date]) availability[item.date] = 0
      })
    }
    res.json({
      data: availability,
      error: null,
    })
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}

/**
 * Add New Reservation
 * @param {*} req
 * @param {*} res
 */
const addReservation = async (req, res) => {
  const { clientId, domainId, product } = client
  const { totalAmount, tickets } = req.body
  try {
    let eachAvailable = true
    let unavailableVehicleSlot = []
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i]
      const { available } = await reservationServices.getParkingSlotAvailability(
        ticket.arrival,
        ticket.departure,
        ticket.vehicleType,
        ticket.parkId,
      )
      if (!available || available <= 0) {
        eachAvailable = false
        unavailableVehicleSlot.push(ticket)
      }
    }
    if (eachAvailable) {
      const checkout = await hobexServices.createCheckout({ amount: totalAmount })
      if (checkout.id) {
        const result = await reservationServices.addReservation({
          ...req.body,
          checkoutId: checkout.id,
          clientId,
          domainId,
          product,
        })
        res.json({
          data: checkout,
          error: null,
        })
      } else {
        res.status(251).json({
          error: 'Unable to create checkout in hobex',
          data: null,
        })
      }
    } else {
      res.status(250).json({
        error: {
          message: 'Slot not available',
          unavailableVehicleSlot,
        },
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

/**
 * Check Reservation Status
 * @param {*} req
 * @param {*} res
 */
const checkReservationStatus = async (req, res) => {
  const { checkoutId } = req.body
  try {
    const status = await hobexServices.checkCheckoutStatus(checkoutId)
    if (status.id) {
      const paymentStatus = getHobexPaymentStatus(status.result.code)
      if (paymentStatus && paymentStatus !== '') {
        const result = await reservationServices.updateReservation(
          { checkoutId },
          {
            $set: {
              paymentStatus,
            },
            $push: {
              transactions: { createdAt: new Date(), amount: status.amount, description: status.result.description },
            },
          },
        )
        const checkout = await reservationServices.PaymentStatusProcessorService(checkoutId, status)
        res.json({ data: checkout, error: null })
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

/**
 * Update Reservation
 * @param {*} req
 * @param {*} res
 */
const updateReservation = async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      for (let i = 0; i < req.body.length; i++) {
        const { reservationId, arrival, departure, amount, serviceAmount, plate, rentalCar } = req.body[i]
        const ticketDoc = {
          ...(arrival ? { 'tickets.$.arrival': DateConvertor(new Date(arrival), 'date') } : {}),
          ...(departure ? { 'tickets.$.departure': DateConvertor(new Date(departure), 'date') } : {}),
          ...(amount ? { 'tickets.$.amount': amount } : {}),
          ...(serviceAmount ? { 'tickets.$.serviceAmount': serviceAmount } : {}),
          ...(plate ? { 'tickets.$.plate': plate } : {}),
          ...(rentalCar ? { 'tickets.$.rentalCar': rentalCar } : {}),
        }
        const result = await reservationServices.updateReservation(
          { 'tickets.reservationId': reservationId },
          ticketDoc,
        )
      }
      res.json({
        data: 'Updated Successfully',
        error: null,
      })
    } else {
      const { reservationId, arrival, departure, amount, serviceAmount, plate, rentalCar } = req.body
      const ticketDoc = {
        ...(arrival ? { 'tickets.$.arrival': DateConvertor(new Date(arrival), 'date') } : {}),
        ...(departure ? { 'tickets.$.departure': DateConvertor(new Date(departure), 'date') } : {}),
        ...(amount ? { 'tickets.$.amount': amount } : {}),
        ...(serviceAmount ? { 'tickets.$.serviceAmount': serviceAmount } : {}),
        ...(plate ? { 'tickets.$.plate': plate } : {}),
        ...(rentalCar ? { 'tickets.$.rentalCar': rentalCar } : {}),
      }
      const result = await reservationServices.updateReservation(
        { 'tickets.reservationId': reservationId },
        { $set: ticketDoc },
      )

      res.json({
        data: result,
        error: null,
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

/**
 * Update Ticket
 * @param {*} req
 * @param {*} res
 */
const updateTicket = async (req, res) => {
  try {
    const { reservationId, arrival, departure, plate, email, template, language } = req.body
    const ticketDetails = await reservationServices.getReservation(
      {
        'tickets.reservationId': parseInt(reservationId),
        'customer.email': email,
        paymentStatus: 'success',
      },
      { 'tickets.$': 1, _id: 0 },
    )
    const toDate = addDays(new Date(), 3)
    const ticketDate = new Date(ticketDetails[0].tickets[0].arrival)

    if (ticketDate > toDate) {
      const bftresult = await bftServices.updateReservation(reservationId, ticketDetails[0].tickets[0].parkId, {
        ...(arrival ? { arrival } : {}),
        ...(departure ? { departure } : {}),
        ...(plate ? { plate } : {}),
      })
      // const updateHistory = {
      //   ...(new Date(arrival) !== new Date(ticketDetails[0].tickets[0].arrival) ? { arrival } : {}),
      //   ...(new Date(departure) !== new Date(ticketDetails[0].tickets[0].departure) ? { departure } : {}),
      //   ...(plate !== ticketDetails[0].tickets[0].plate ? { plate } : {}),
      // },
      const updatesHistory = {
        createdAt: new Date(),
        ...(new Date(arrival).getTime() !== new Date(ticketDetails[0].tickets[0].arrival).getTime()
          ? { arrival: ticketDetails[0].tickets[0].arrival }
          : {}),
        ...(new Date(departure).getTime() !== new Date(ticketDetails[0].tickets[0].departure).getTime()
          ? { departure: ticketDetails[0].tickets[0].departure }
          : {}),
        ...(plate !== ticketDetails[0].tickets[0].plate ? { plate: ticketDetails[0].tickets[0].plate } : {}),
        mailSent: ticketDetails[0].tickets[0].mailSent || false,
      }
      const ticketDoc = {
        ...(arrival ? { 'tickets.$.arrival': DateConvertor(new Date(arrival), 'date') } : {}),
        ...(departure ? { 'tickets.$.departure': DateConvertor(new Date(departure), 'date') } : {}),
        ...(plate ? { 'tickets.$.plate': plate } : {}),
        ...(template ? { 'tickets.$.template': template } : {}),
        'tickets.$.mailSent': false,
        // $push: {
        //   'tickets.$.updatesHistory': { updatesHistory },
        // },
      }

      const result = await reservationServices.updateReservation(
        { 'tickets.reservationId': reservationId },
        { $set: ticketDoc, $push: { 'tickets.$.updatesHistory': updatesHistory } },
      )
      if (result) {
        const updatedTicketDetails = await reservationServices.getReservation(
          {
            'tickets.reservationId': parseInt(reservationId),
            'customer.email': email,
            paymentStatus: 'success',
          },
          { 'tickets.$': 1, _id: 0, customer: 1, checkoutId: 1 },
        )
        if (updatedTicketDetails) {
          // const mailInfo = await mailerServices.sendEmail({
          //   to: email,
          //   subject: UPDATED_TICKET.subject[language || 'en'],
          //   text: 'Hello ' + updatedTicketDetails[0].customer.name,
          //   html: updatedTicketDetails[0].tickets[0].template,
          // })
          // if (mailInfo) {
          //   res.json({
          //     data: updatedTicketDetails[0],
          //     error: null,
          //   })
          // }
          const sendMail = await fetch(`${domain}/api/1/mailer/reservation/${updatedTicketDetails[0].checkoutId}`, {
            method: 'POST',
          })
          if (sendMail) {
            res.json({
              data: updatedTicketDetails[0],
              error: null,
            })
          }
        }
      } else {
        res.status(252).json({
          data: null,
          error: `There are some issues with updating your ticket.`,
        })
      }
    } else {
      if (new Date(arrival).getTime() !== ticketDate.getTime()) {
        res.status(255).json({
          data: null,
          error: `Sorry, we cannot update the arrival date before 3 days.`,
        })
      } else {
        const ticketDoc = {
          ...(plate ? { 'tickets.$.plate': plate } : {}),
          ...(template ? { 'tickets.$.template': template } : {}),
        }
        const result = await reservationServices.updateReservation(
          { 'tickets.reservationId': reservationId },
          { $set: ticketDoc },
        )
        if (result) {
          const updatedTicketDetails = await reservationServices.getReservation(
            {
              'tickets.reservationId': parseInt(reservationId),
              'customer.email': email,
              paymentStatus: 'success',
            },
            { 'tickets.$': 1, _id: 0, customer: 1 },
          )
          if (updatedTicketDetails) {
            const mailInfo = await mailerServices.sendEmail({
              to: email,
              subject: UPDATED_TICKET.subject[language || 'en'],
              text: 'Hello ' + updatedTicketDetails[0].customer.name,
              html: updatedTicketDetails[0].tickets[0].template,
            })
            if (mailInfo) {
              res.json({
                data: updatedTicketDetails[0],
                error: null,
              })
            }
          }
        } else {
          res.status(252).json({
            data: null,
            error: `There are some issues with updating your ticket.`,
          })
        }
      }
    }
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
      data: null,
    })
  }
}

/**
 * Cacnel Reservation
 * @param {*} req
 * @param {*} res
 */
const cancelTicket = async (req, res) => {
  try {
    const { reservationId, email, language } = req.body
    const ticketDetails = await reservationServices.getReservation(
      {
        'tickets.reservationId': parseInt(reservationId),
        'customer.email': email,
        paymentStatus: 'success',
      },
      { 'tickets.$': 1, _id: 0, checkoutId: 1 },
    )
    const toDate = addDays(new Date(), 3)
    const ticketDate = new Date(ticketDetails[0].tickets[0].arrival)

    if (ticketDetails[0].tickets[0].ticketStatus === RESERVATION.TICKETSTATUS.CONFIRMED) {
      if (ticketDate > toDate) {
        const hobexRes = await hobexServices.cancelCheckout({
          id: ticketDetails[0].checkoutId.split('.')[0].toLowerCase(),
          amount: ticketDetails[0].tickets[0].amount,
        })
        const isTicketCanceled = /^(000\.000\.|000\.100\.1|000\.[36])/.test(hobexRes.result.code)

        if (isTicketCanceled) {
          const bftresult = await bftServices.deleteReservation(reservationId, ticketDetails[0].tickets[0].parkId)
          const result = await reservationServices.updateReservation(
            { 'tickets.reservationId': reservationId },
            {
              $set: {
                'tickets.$.ticketStatus': RESERVATION.TICKETSTATUS.CANCELED,
                'tickets.$.mailSent': false,
              },
              $push: {
                transactions: {
                  createdAt: new Date(),
                  amount: ticketDetails[0].tickets[0].amount,
                  description: hobexRes.result.description,
                },
              },
            },
          )
          if (result) {
            const sendMail = await fetch(`${domain}/api/1/mailer/reservation/${ticketDetails[0].checkoutId}`, {
              method: 'POST',
            })
            if (sendMail) {
              res.json({
                data: hobexRes.result,
                error: null,
              })
            }
          }
        } else {
          res.status(253).json({
            data: null,
            error: hobexRes.result,
          })
        }
      } else {
        res.status(255).json({
          data: null,
          error: `You can not cancel your booking before 3 days`,
        })
      }
    } else {
      res.status(256).json({
        data: null,
        error: `Your ticket is already been canceled.`,
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
  getReservations,
  getReservation,
  otpVerification,
  getTodaysReservations,
  getCalendarData,
  getRangeBasedReservations,
  getRangeBasedCheckouts,
  checkParkingSlotAvailable,
  getAvailability,
  addReservation,
  checkReservationStatus,
  updateReservation,
  updateTicket,
  cancelTicket,
}
