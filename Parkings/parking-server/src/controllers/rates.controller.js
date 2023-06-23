// REQUIRES ==============================================================
const { ratesServices } = require('../services')
const { DateConvertor, genrateRandomCode } = require('../utils/utils')
const { RatesModel } = require('../models') // Note : RatesModel is here for complex queries only prefer using ratesServices to access DB.
// CONTROLLERS ===========================================================

/**
 * Create Rates controller
 * @param {*} req
 * @param {*} res
 */
const getRates = async (req, res) => {
  try {
    const {clientId} = req.params;
    const result = await ratesServices.getRates({clientId})
    res.json({ data: result, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Create Rates controller
 * @param {*} req
 * @param {*} res
 */
const getTodaysRates = async (req, res) => {
  try {
    const {clientId} = req.params;
    const { startDate, endDate, parkId, vehicleType, ticketType } = req.query
    const result = await ratesServices.getRangeBasedRates(clientId, startDate, endDate, {
      ...(parkId ? { parkId } : {}),
      ...(vehicleType ? { vehicleType } : {}),
      ...(ticketType ? { ticketType } : {}),
    })
    res.json({ data: result, error: null })
  } catch (error) {
    console.log('error', error)
    res.json({
      error: error,
    })
  }
}

/**
 * Add New Rate
 * @param {*} req
 * @param {*} res
 */
const addRate = async (req, res) => {
  const {clientId} = req.params;
  console.log('... adding new Rate...')
  try {
    let newRate = {
      ...req.body,
      clientId,
      prices: req.body.prices.map((item) => {
        return {
          ...item,
          id: genrateRandomCode(8),
          startDate: DateConvertor(item.startDate, 'date', 'start'),
          endDate: DateConvertor(item.endDate, 'date', 'end'),
        }
      }),
    }
    const result = await ratesServices.addRate(newRate)
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
 * Update Rate
 * @param {*} req
 * @param {*} res
 */
const addGapRate = async (req, res) => {
  const {clientId} = req.params;
  console.log('... Adding Gap Rate...')
  try {
    const { startDate, endDate, ticketType, vehicleType, amount, serviceAmount, parkId } = req.body
    const checkAvailable = await ratesServices.getRangeBasedRates(clientId, startDate, endDate, {
      ticketType,
      vehicleType,
      parkId,
    })
    if (checkAvailable && checkAvailable.length) {
      res.json({
        data: null,
        error: 'Conflict with another slot',
      })
    } else {
      let newRate = {
        amount,
        serviceAmount,
        id: genrateRandomCode(8),
        startDate: DateConvertor(startDate, 'date', 'start'),
        endDate: DateConvertor(endDate, 'date', 'end'),
      }
      const result = await ratesServices.updateRate(
        {
          clientId,
          ticketType,
          vehicleType,
          parkId,
        },
        { $push: { prices: { $each: [newRate], $sort: { startDate: 1 } } } },
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
 * Update Rate
 * @param {*} req
 * @param {*} res
 */
const updateSlotRate = async (req, res) => {
  const {clientId} = req.params;
  console.log('... updating Slot Rate...')
  try {
    const { id, startDate, endDate, ticketType, vehicleType, amount, serviceAmount, parkId } = req.body
    const checkAvailable = await ratesServices.getRangeBasedRates(clientId, startDate, endDate, {
      ticketType,
      vehicleType,
      parkId,
    })
    console.log(checkAvailable)
    if (checkAvailable && checkAvailable.length && checkAvailable[0].prices?.length === 1 && id) {
      let newRate = {
        amount,
        serviceAmount,
        startDate: DateConvertor(startDate, 'date', 'start'),
        endDate: DateConvertor(endDate, 'date', 'end'),
      }
      const result = await ratesServices.updateRate(
        {
          clientId,
          ticketType,
          vehicleType,
          parkId,
          'prices.id': id,
        },
        {
          'prices.$.startDate': newRate.startDate,
          'prices.$.endDate': newRate.endDate,
          'prices.$.amount': newRate.amount,
          'prices.$.serviceAmount': newRate.serviceAmount,
        },
      )
      res.json({
        data: result,
        error: null,
      })
    } else {
      res.json({
        data: null,
        error: 'Conflicting Other Slots',
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
 * Delete Slot Rate
 * @param {*} req
 * @param {*} res
 */
const deleteSlotRate = async (req, res) => {
  const {clientId} = req.params;
  console.log('... deleting Slot Rate...')
  try {
    const { id, ticketType, vehicleType } = req.body
    if ((id, ticketType, vehicleType)) {
      const result = await ratesServices.updateRate(
        {
          clientId,
          ticketType,
          vehicleType,
          'prices.id': id,
        },
        { $pull: { prices: { id } } },
      )
      res.json({
        data: result,
        error: null,
      })
    } else {
      res.json({
        data: null,
        error: 'Missing paramaters',
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
  getRates,
  getTodaysRates,
  addRate,
  addGapRate,
  updateSlotRate,
  deleteSlotRate,
}
