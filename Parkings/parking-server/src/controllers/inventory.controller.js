// REQUIRES ==============================================================
const { InventoryModel } = require('../models')
const { inventoryServices } = require('../services')
const { DateConvertor } = require('../utils/utils')
// CONTROLLERS ===========================================================
/**
 * Get all Inventories
 * @param {*} req
 * @param {*} res
 */
const getAllInventories = async (req, res) => {
  const {clientId} = req.params;
  console.log('...get All inventory entries...')
  try {
    const allInventories = await inventoryServices.getInventory({clientId})
    res.json({ data: allInventories, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get Today's Inventory
 * @param {*} req
 * @param {*} res
 */
const getTodaysInventory = async (req, res) => {
  const {clientId} = req.params;
  console.log("...get Today's inventory...")
  try {
    const { date, vehicleType, parkId } = req.query
    const inventory = await inventoryServices.getTodaysInventory(clientId, date || new Date(), vehicleType, parkId)
    res.json({ data: inventory, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get Inventory Slots
 * @param {*} req
 * @param {*} res
 */
const getInventorySlots = async (req, res) => {
  const {clientId} = req.params;
  console.log("...get Today's inventory...")
  try {
    const { startDate, endDate, vehicleType, parkId } = req.query
    const start = DateConvertor(new Date(startDate), 'date', 'start')
    const end = DateConvertor(new Date(endDate || startDate), 'date', 'end')
    const inventory = await inventoryServices.getInventory({
      clientId,
      startDate: { $lte: end },
      endDate: { $gte: start },
      vehicleType: vehicleType,
      parkId: parkId,
    })
    res.json({ data: inventory, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Get Range Based Inventory
 * @param {*} req
 * @param {*} res
 */
const getRangeBasedInventory = async (req, res) => {
  const {clientId} = req.params;
  console.log("...get Today's inventory...")
  try {
    const { startDate, endDate, vehicleType, parkId } = req.query
    const inventory = await inventoryServices.getRangeBasedInventory(clientId, startDate, endDate, vehicleType, parkId)
    res.json({ data: inventory, error: null })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

/**
 * Create New Inventory
 * @param {*} req
 * @param {*} res
 */
const createNewInventory = async (req, res) => {
  const {clientId} = req.params;
  console.log('...creating new inventory...')
  try {
    const { startDate, endDate } = req.body
    let newInventory = {
      ...req.body,
      clientId,
      startDate: DateConvertor(startDate, 'date', 'start'),
      endDate: DateConvertor(endDate, 'date', 'end'),
    }
    const result = await inventoryServices.createInventory(newInventory)
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

// EXPORTS ================================================================
module.exports = {
  getAllInventories,
  getTodaysInventory,
  getRangeBasedInventory,
  getInventorySlots,
  createNewInventory,
}
