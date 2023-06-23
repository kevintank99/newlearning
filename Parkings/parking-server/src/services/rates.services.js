// REQUIRES ===============================================================
const {RatesModel} = require("../models")

// SERVICES ===============================================================
/**
 * Get Rates
 * @param {*} query
 * @returns
 */
const getRates= async (query) => {
return await RatesModel.find(query)
};
/**
 * Get Rates
 * @param {string} clientId
 * @param {Date|number} startDate
 * @param {Date|number} endDate
 * @param {object} query
 * @returns
 */
const getRangeBasedRates= async (clientId, startDate, endDate, query={}) => {
    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate
      ? new Date(endDate)
      : startDate
      ? new Date(startDate)
      : new Date()
    return await RatesModel.aggregate([
      {
        $match: {
          clientId,
          prices: {
            $elemMatch: {
              startDate: { $lte: new Date(end) },
              endDate: { $gte: new Date(start) },
            },
          },
          ...(query)
        },
      },
      {
        $project: {
          createdAt: 1,
          lastUpdatedAt: 1,
          vehicleType:1,
          ticketType:1,
          parkId:1,
          _id: 1,
          prices: {
            $filter: {
              input: '$prices',
              as: 'price',
              cond: {
                $and: [{ $lte: ['$$price.startDate', new Date(end)] }, { $gte: ['$$price.endDate', new Date(start)] }],
              },
            },
          },
        },
      },
    ])
};
/**
 * Insert New Rates
 * @param {*} body
 * @returns
 */
const addRate = async (body) => {
    let inventory = new RatesModel(body);
    return await inventory.save();
};
/**
 * Update Rates
 * @param {*} query
 * @param {*} body
 * @returns
 */
const updateRate = async (query, body) => {
    return await RatesModel.updateOne(query, body)
};
/**
 * Delete Rates
 * @param {*} query
 * @returns
 */
const deleteRate = async (query) => {
    return await RatesModel.delete(query)
};

// EXPORTS ================================================================
module.exports = {
    getRates,
    getRangeBasedRates,
    addRate,
    updateRate,
    deleteRate
  };
  
