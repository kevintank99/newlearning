// REQUIRES ===============================================================
const { bft } = require('../config')
const fetch = require('node-fetch')
const { ReservationModel } = require('../models')

// RESERVATION SERVICES ===============================================================
// TODO: Separately defined getReservation, updateTicket services due to circular dependency error
/**
 * Get Reservation
 * @param {*} query
 * @returns
 */
const getReservationService = async (query, option) => {
  return await ReservationModel.find(query, option)
}

/**
 * Update a particular ticket in Reservation
 * @param {*} id id can be reservationId or _id
 * @param {*} document fields to be updated
 * @param {*} additionalQuery additional query to modify search.
 * @returns
 */
const updateTicketService = async (id, document, additionalQuery) => {
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

// SERVICES ===============================================================
const { reservationServices } = require('./reservation.services')

/**
 * Create Reservation
 * @param {*} data
 * @param {string} parkId
 * @returns
 */
const createReservation = async (data, parkId) => {
  return fetch(`${bft.url}/reservations/${parkId}/`, {
    method: 'POST',
    headers: {
      [bft.headersKey]: `${bft.headersValue}`,
    },
    body: JSON.stringify(data),
  })
}

/**
 * Get Reservation
 * @param {string} reservationId
 * @param {string} parkId
 * @returns
 */
const getReservation = async (reservationId, parkId) => {
  const result = await fetch(`${bft.url}/reservations/${parkId}/${reservationId}`, {
    method: 'GET',
    headers: {
      [bft.headersKey]: `${bft.headersValue}`,
    },
  })
  return await result.json()
}

/**
 * Update Reservation
 * @param {string} reservationId
 * @param {string} parkId
 * @param {*} data
 * @returns
 */
const updateReservation = async (reservationId, parkId, data) => {
  const { arrival, departure, amount, serviceAmount, plate } = data
  const reservation = await getReservationService(
    {
      'tickets.reservationId': parseInt(reservationId),
    },
    { 'tickets.$': 1, _id: 0 },
  )
  const reservationDetails = reservation[0]
  const response = await fetch(`${bft.url}/reservations/${parkId}/${reservationId}`, {
    method: 'PUT',
    headers: {
      [bft.headersKey]: `${bft.headersValue}`,
    },
    body: JSON.stringify({
      ...(arrival ? { arrival } : {}),
      ...(departure ? { departure } : {}),
      ...(amount ? { amount } : {}),
      ...(serviceAmount ? { serviceAmount } : {}),
      ...(plate ? { plate } : {}),
    }),
  })
  const result = await response.json()
  if (result.id) {
    const updates = await updateTicketService(parseInt(reservationId), {
      bftHistory: {
        createdAt: new Date(),
        reservationId: parseInt(reservationId),
        type: 'updateReservation',
        history: {
          ...(arrival ? { arrival: reservationDetails.tickets[0].arrival } : {}),
          ...(departure ? { departure: reservationDetails.tickets[0].departure } : {}),
          ...(plate ? { plate: reservationDetails.tickets[0].plate } : {}),
        },
      },
    })
  }
  return result
}

/**
 * Delete Reservation
 * @param {string} reservationId
 * @param {string} parkId
 * @returns
 */
const deleteReservation = async (reservationId, parkId) => {
  const response = await fetch(`${bft.url}/reservations/${parkId}/${reservationId}`, {
    method: 'DELETE',
    headers: {
      [bft.headersKey]: `${bft.headersValue}`,
    },
  })
  // const result = await response.json()
  const canceled = await updateTicketService(parseInt(reservationId), {
    bftHistory: {
      createdAt: new Date(),
      reservationId: parseInt(reservationId),
      type: 'cancelReservation',
    },
  })
  return response
}

// EXPORTS ================================================================
module.exports = {
  createReservation,
  getReservation,
  updateReservation,
  deleteReservation,
}
