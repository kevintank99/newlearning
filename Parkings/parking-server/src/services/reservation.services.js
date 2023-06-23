// REQUIRES ===============================================================
const fetch = require('node-fetch')
const { ReservationModel } = require('../models')
const { DateConvertor, getHobexPaymentStatus } = require('../utils/utils')
const { RESERVATION, PAYMENT } = require('../constants/app.constants')
const inventoryServices = require('./inventory.services')
const bftServices = require('./bft.services')
const { ObjectId } = require('mongodb')
const { domain } = require('../config')
// SERVICES ===============================================================
// TODO: Separately defined getReservation, updateTicket services in BFT services due to circular dependency error
/**
 * Get Reservation
 * @param {*} query
 * @returns
 */
const getReservation = async (query, option) => {
  return await ReservationModel.find(query, option)
}

/**
 * Get Todays Reservation
 * @param {Date | number} arrival
 * @param {Date | number =} departure
 * @param {string} vehicleType
 * @param {string} parkId
 * @param {*} query
 * @returns todays reservations and total count of reservations
 */
const getTodaysReservations = async (arrival, departure, vehicleType, parkId, query = {}) => {
  const start = DateConvertor(new Date(arrival), 'date', 'start')
  const end = DateConvertor(new Date(departure || arrival), 'date', 'end')
  return await ReservationModel.aggregate([
    {
      $facet: {
        reservations: [
          {
            $unwind: {
              path: '$tickets',
            },
          },
          {
            $match: {
              'tickets.vehicleType': vehicleType,
              'tickets.parkId': parkId,
              'tickets.arrival': { $gte: start },
              'tickets.departure': { $lte: end },
            },
          },
        ],
        count: [
          {
            $unwind: {
              path: '$tickets',
            },
          },
          {
            $match: {
              'tickets.vehicleType': vehicleType,
              'tickets.parkId': parkId,
              'tickets.arrival': { $gte: start },
              'tickets.departure': { $lte: end },
            },
          },
          { $count: 'total' },
        ],
      },
    },
  ])
}

/**
 * Get Todays Reservation count
 * @param {Date | number} arrival
 * @param {Date | number =} departure
 * @param {string} vehicleType
 * @param {string} parkId
 * @param {*} query
 * @returns todays count of reservations
 */
const getTodaysReservationsCount = async (arrival, departure, vehicleType, parkId, query = {}) => {
  const start = DateConvertor(new Date(arrival), 'date', 'start')
  const end = DateConvertor(new Date(departure || arrival), 'date', 'end')
  return await ReservationModel.aggregate([
    {
      $unwind: {
        path: '$tickets',
      },
    },
    {
      $match: {
        'tickets.vehicleType': vehicleType,
        'tickets.parkId': parkId,
        'tickets.arrival': { $gte: start },
        'tickets.departure': { $lte: end },
      },
    },
    { $count: 'total' },
  ])
}

/**
 * Get Range Based Reservation count
 * @param {Date | number = } startDate
 * @param {Date | number =} endDate
 * @param {string} vehicleType
 * @param {string} parkId
 * @param {*} query
 * @returns todays count of reservations
 */
const getRangeBasedReservations = async (startDate, endDate, vehicleType, parkId, query = {}) => {
  const start = startDate
    ? DateConvertor(new Date(startDate), 'date', 'start')
    : DateConvertor(new Date(), 'date', 'beginningOfMonth')
  const end = endDate
    ? DateConvertor(new Date(endDate), 'date', 'end')
    : DateConvertor(new Date(), 'date', 'endOfMonth')
  return await ReservationModel.aggregate([
    {
      $match: {
        'tickets.arrival': {
          $gte: start,
          $lte: end,
        },
        'tickets.vehicleType': vehicleType,
        'tickets.parkId': parkId,
        ...query,
      },
    },
    {
      $unwind: '$tickets',
    },
    {
      $match: {
        'tickets.arrival': {
          $gte: start,
          $lte: end,
        },
        'tickets.vehicleType': vehicleType,
        'tickets.parkId': parkId,
        ...query,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%d/%m/%Y',
            date: {
              $toDate: '$tickets.arrival',
            },
          },
        },
        count: { $sum: 1 },
      },
    },
  ])
}

/**
 * Get Todays Checkedout vehicles count
 * @param {Date | number} arrival
 * @param {Date | number =} departure
 * @param {string} vehicleType
 * @param {string} parkId
 * @param {*} query
 * @returns todays count of checkedout vehicles
 */
const getTodaysCheckoutCount = async (arrival, departure, vehicleType, parkId, query = {}) => {
  const start = DateConvertor(new Date(arrival), 'date', 'start')
  const end = DateConvertor(new Date(departure || arrival), 'date', 'end')
  return await ReservationModel.aggregate([
    {
      $unwind: {
        path: '$tickets',
      },
    },
    {
      $match: {
        'tickets.vehicleType': vehicleType,
        'tickets.parkId': parkId,
        'tickets.arrival': { $gte: start },
        'tickets.departure': { $lte: end },
        'tickets.vehicleStatus': RESERVATION.VEHICLESTATUS.CHECKEDOUT,
      },
    },
    { $count: 'total' },
  ])
}

/**
 * Get Parking slot Availability for specific date
 * @param {Date | number} arrival
 * @param {Date | number =} departure
 * @param {string} vehicleType
 * @param {string} parkId
 * @param {*} query
 * @returns
 */
const getParkingSlotAvailability = async (arrival, departure, vehicleType, parkId) => {
  const [todaysBooking] = await getTodaysReservationsCount(arrival, departure || arrival, vehicleType, parkId)
  const [todaysCheckouts] = await getTodaysCheckoutCount(arrival, departure || arrival, vehicleType, parkId)
  const todaysInventory = await inventoryServices.getTodaysInventory(arrival, vehicleType, parkId)
  const total = todaysInventory.find(
    (item) => item.vehicleType === vehicleType && item.parkId === parkId,
  )?.numberOfVehicle
  return { available: total ? total - (todaysBooking?.total || 0) + (todaysCheckouts?.total || 0) : 0 }
}

/**
 * Get Range based Slot Availability
 * @param {Date | number =} arrival
 * @param {Date | number =} departure
 * @param {string} vehicleType
 * @param {string} parkId
 * @param {*} query
 * @returns
 */
const getRangeBasedAvailability = async (arrival, departure, vehicleType, parkId) => {
  const bookings = await getRangeBasedReservations(arrival, departure || arrival, vehicleType, parkId)
  const checkouts = await getRangeBasedReservations(arrival, departure || arrival, vehicleType, parkId, {
    'tickets.vehicleStatus': RESERVATION.VEHICLESTATUS.CHECKEDOUT,
  })
  const inventory = await inventoryServices.getRangeBasedInventory(arrival, departure, vehicleType, parkId)
  bookings.forEach((item) => {
    inventory[item._id] -= item.count
  })
  checkouts.forEach((item) => {
    inventory[item._id] += item.count
  })
  return inventory
  // return { available: total ? total - (todaysBooking?.total || 0) + (todaysCheckouts?.total || 0) : 0 }
}

/**
 * Insert New Reservation
 * @param {*} body
 * @returns
 */
const addReservation = async (body) => {
  let inventory = new ReservationModel(body)
  return await inventory.save()
}

/**
 * Update a Reservation
 * @param {*} body
 * @returns
 */
const updateReservation = async (query, document) => {
  return await ReservationModel.updateOne(query, document)
}
/**
 * Update a particular ticket in Reservation
 * @param {*} id id can be reservationId or _id
 * @param {*} document fields to be updated
 * @param {*} additionalQuery additional query to modify search.
 * @returns
 */
const updateTicket = async (id, document, additionalQuery) => {
  const {
    reservationId,
    vehicleType,
    ticketType,
    amount,
    parkId,
    arrival,
    departure,
    plate,
    rentalCar,
    qrCode,
    template,
    vehicleStatusHistory,
    ticketStatus,
    mailSent,
    bftSync,
    bftHistory,
    qrCodeImage,
  } = document
  return await ReservationModel.updateOne(
    { ...(!isNaN(id) ? { 'tickets.reservationId': id } : { 'tickets._id': id }), ...additionalQuery },
    {
      $set: {
        ...(reservationId ? { 'tickets.$.reservationId': reservationId } : {}),
        ...(vehicleType ? { 'tickets.$.vehicleType': vehicleType } : {}),
        ...(ticketType ? { 'tickets.$.ticketType': ticketType } : {}),
        ...(amount ? { 'tickets.$.amount': amount } : {}),
        ...(parkId ? { 'tickets.$.parkId': parkId } : {}),
        ...(arrival ? { 'tickets.$.arrival': arrival } : {}),
        ...(departure ? { 'tickets.$.departure': departure } : {}),
        ...(plate ? { 'tickets.$.plate': plate } : {}),
        ...(rentalCar ? { 'tickets.$.rentalCar': rentalCar } : {}),
        ...(qrCode ? { 'tickets.$.qrCode': qrCode } : {}),
        ...(template ? { 'tickets.$.template': template } : {}),
        ...(ticketStatus ? { 'tickets.$.ticketStatus': ticketStatus } : {}),
        ...(bftSync ? { bftSync: bftSync } : {}),
        ...(mailSent ? { 'tickets.$.mailSent': mailSent } : {}),
        ...(qrCodeImage ? { 'tickets.$.qrCodeImage': qrCodeImage } : {}),
      },
      $push: {
        ...(bftHistory ? { bftHistory: bftHistory } : {}),
        ...(vehicleStatusHistory ? { 'tickets.$.vehicleStatusHistory': vehicleStatusHistory } : {}),
      },
    },
  )
}

const PaymentStatusProcessorService = async (checkoutId, payload) => {
  const reservation = await getReservation({ checkoutId })
  const paymentStatus = getHobexPaymentStatus(payload.result.code)
  const reservationDetails = reservation?.[0]
  if (paymentStatus === PAYMENT.STATUS.SUCCESS && !reservationDetails?.bftSync) {
    const sendreservations = []
    for (let i = 0; i < reservationDetails?.tickets?.length; i++) {
      let ticket = reservationDetails?.tickets[i]
      sendreservations.push(
        bftServices.createReservation(
          {
            arrival: ticket?.arrival,
            departure: ticket?.departure,
            amount: ticket?.amount,
            serviceAmount: ticket?.serviceAmount || 0,
            plate: ticket?.plate,
            rentalCar: ticket?.rentalCar,
            vehicle: ticket?.vehicle,
            name: reservationDetails?.customer?.name,
            email: reservationDetails?.customer?.email,
            surname: reservationDetails?.customer?.surname,
            phone: reservationDetails?.customer?.phone,
          },
          ticket?.parkId,
        ),
      )
    }
    const sendAllReservations = await Promise.all(sendreservations)
    const result = await Promise.all(sendAllReservations.map((item) => item.json()))
    for (let i = 0; i < result.length; i++) {
      let ticket = reservationDetails?.tickets[i]

      await updateTicket(ticket?._id, {
        ticketStatus: RESERVATION.TICKETSTATUS.CONFIRMED,
        reservationId: result[i].id,
        qrCode: result[i].qrCode,
        template: ticket.template.replace(`{{reservationId}}`, result[i].id),
        bftSync: true,
        bftHistory: {
          createdAt: new Date(),
          reservationId: result[i].id,
          qrCode: result[i].qrCode,
          type: 'newReservation',
        },
      })
    }
    const sendMail = await fetch(`${domain}/api/1/mailer/reservation/${checkoutId}`, {
      method: 'POST',
    })
  }
  const checkout = await getReservation({ checkoutId })
  return checkout[0]
}

// EXPORTS ================================================================
module.exports = {
  getReservation,
  getTodaysReservations,
  getTodaysReservationsCount,
  getRangeBasedReservations,
  getTodaysCheckoutCount,
  getParkingSlotAvailability,
  getRangeBasedAvailability,
  addReservation,
  updateReservation,
  updateTicket,
  PaymentStatusProcessorService,
}
