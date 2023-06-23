
const { Schema, model } = require('mongoose')
const { INVENTORY } = require("../constants/app.constants");
const {VEHICLE} = INVENTORY
const inventorySchema = new Schema(
  {
    vehicleType: {
      type: String,
      require: true,
      enum: [VEHICLE.CARTYPE, VEHICLE.MOTORBIKETYPE, VEHICLE.CAMPERTYPE, VEHICLE.TRUCKTYPE, VEHICLE.COACHTYPE],
    },
    parkId: {
      type: String,
      require: true,
    },
    clientId: {
      type: String,
      require: true,
    },
    numberOfVehicle: {
      type: Number,
      require: true,
    },
    startDate: {
      type: Date,
      require: true,
    },
    endDate: {
      type: Date,
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
  },
  { timestamps: true, versionKey: false, collection: 'parkingInventory' },
)
const InventoryModel = model('parkingInventory', inventorySchema)

module.exports = InventoryModel
