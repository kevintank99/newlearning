// REQUIRES ===============================================================
const { InventoryModel } = require('../models')
const { DateConvertor, convertToRangeBasedInventory } = require('../utils/utils')
// SERVICES ===============================================================
/**
 * Get Inventory
 * @param {*} query
 * @returns
 */
const getInventory = async (query) => {
  return await InventoryModel.find(query)
}
/**
 * Get Inventory
 * @param {string} clientId
 * @param {Date | number} date
 * @param {string} vehicleType
 * @param {string} parkId
 * @returns
 */
const getTodaysInventory = async (clientId, date, vehicleType = '', parkId = '') => {
  const today = date ? new Date(date) : new Date()
  const result = await InventoryModel.find({
    clientId,
    startDate: { $lte: today },
    endDate: { $gte: today },
    ...(vehicleType ? { vehicleType } : {}),
    ...(parkId ? { parkId } : {}),
  })
  const data = result?.reduce((acc, curr) => {
    if (acc[curr.vehicleType + 'parkId' + curr.parkId]) {
      acc[curr.vehicleType + 'parkId' + curr.parkId].numberOfVehicle += curr.numberOfVehicle
    } else {
      acc[curr.vehicleType + 'parkId' + curr.parkId] = {
        vehicleType: curr.vehicleType,
        parkId: curr.parkId,
        numberOfVehicle: curr.numberOfVehicle,
      }
    }
    return acc
  }, {})
  return Object.values(data)
}

/**
 * Get Range Based vehicle count
 * @param {string} clientId
 * @param {Date | number =} startDate
 * @param {Date | number =} endDate
 * @param {string} vehicleType
 * @param {string} parkId
 * @returns
 */
const getRangeBasedInventory = async (clientId, startDate, endDate, vehicleType, parkId) => {
  const start = DateConvertor(new Date(startDate), 'date', 'start')
  const end = DateConvertor(new Date(endDate || startDate), 'date', 'end')
  const result = await InventoryModel.find({
    clientId,
    startDate: { $lte: end },
    endDate: { $gte: start },
    vehicleType: vehicleType,
    parkId: parkId,
  })
  return convertToRangeBasedInventory(result, start, end);
  // const data = result?.reduce((acc, curr) => {
  //   if (acc[curr.vehicleType + 'parkId' + curr.parkId]) {
  //     acc[curr.vehicleType + 'parkId' + curr.parkId].numberOfVehicle += curr.numberOfVehicle
  //   } else {
  //     acc[curr.vehicleType + 'parkId' + curr.parkId] = {
  //       vehicleType: curr.vehicleType,
  //       parkId: curr.parkId,
  //       numberOfVehicle: curr.numberOfVehicle,
  //     }
  //   }
  //   return acc
  // }, {})
  // return Object.values(data)
}
/**
 * Insert New Inventory
 * @param {*} body
 * @returns
 */
const createInventory = async (body) => {
  let inventory = new InventoryModel(body)
  return await inventory.save()
}
/**
 * Update Inventory
 * @param {*} query
 * @param {*} body
 * @returns
 */
const updateInventory = async (query, body) => {
  return await InventoryModel.updateMany(query, body)
}
/**
 * Delete Inventory
 * @param {*} query
 * @returns
 */
const deleteInventory = async (query) => {
  return await InventoryModel.delete(query)
}

// EXPORTS ================================================================
module.exports = {
  getInventory,
  getTodaysInventory,
  getRangeBasedInventory,
  createInventory,
  updateInventory,
  deleteInventory,
}
