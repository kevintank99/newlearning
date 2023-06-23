
const { Schema, model } = require('mongoose')
const { INVENTORY } = require('../constants/app.constants')
const { VEHICLE, TICKET } = INVENTORY
const ratesSchema = new Schema(
  {
    vehicleType: {
      type: String,
      require: true,
      enum: [VEHICLE.CARTYPE, VEHICLE.MOTORBIKETYPE, VEHICLE.CAMPERTYPE, VEHICLE.TRUCKTYPE, VEHICLE.COACHTYPE],
    },
    ticketType: {
      type: String,
      require: true,
      enum: [TICKET.DAILY],
    },
    parkId: {
      type: String,
      require: true,
    },
    clientId: {
      type: String,
      require: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    serviceAmount: {
      type: Number,
      require: true,
    },
    startDate: {
      type: Number,
      require: true,
    },
    endDate: {
      type: Number,
      require: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    lastUpdatedAt: {
      type: Date,
      default: new Date(),
    },
    prices: Array,
  },
  { timestamps: true, versionKey: false, collection: 'parkingRates' },
)
ratesSchema.index({ vehicleType: 1, parkId: 1, ticketType: 1, clientId : 1 }, { unique: true })

const RatesModel = model('parkingRates', ratesSchema)

module.exports = RatesModel
