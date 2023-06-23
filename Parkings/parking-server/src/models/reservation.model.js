
const { Schema, model } = require('mongoose')
const { INVENTORY, PAYMENT, RESERVATION, LANGUAGES } = require('../constants/app.constants')
const { VEHICLE, TICKET } = INVENTORY
const { VEHICLESTATUS, TICKETSTATUS } = RESERVATION
const TicketSchema = new Schema({
  reservationId: {
    type: Number,
  },
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
  parkId:{
    type: String,
    require: true,
  },
  amount: {
    type: Number,
    require: true,
    min: 0,
  },
  serviceAmount: {
    type: Number,
    require: true,
    min: 0,
  },
  arrival: {
    type: Date,
    require: true,
  },
  departure: {
    type: Date,
    require: true,
  },
  plate: {
    type: String,
    require: true,
    maxLength: 10,
  },
  rentalCar: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  qrCode: {
    type: String,
  },
  qrCodeImage: {
    type: String,
  },
  template: {
    type: String,
    require: true,
  },
  // updateHistory: { type: Array },
  ticketStatus:{
    type : String,
    enum: [TICKETSTATUS.CONFIRMED]
  },
  vehicleStatus:{
    type : String,
    enum: [VEHICLESTATUS.CHECKEDIN, VEHICLESTATUS.CHECKEDOUT]
  },
  vehicleStatusHistory:[{
    vehicleStatus:{
      type : String,
      enum: [VEHICLESTATUS.CHECKEDIN, VEHICLESTATUS.CHECKEDOUT]
    },
    createdAt:{
      type : Date,
      default : new Date()
    }
  }],
  mailSent:{
    type: Boolean,
  },
  updatesHistory:{
    type : Array,
  },
  fetched: {
    type : Boolean,
  }
})
const CustomerSchema = new Schema({
  name: {
    type: String,
    require: true,
    maxlength: 32,
  },
  surname: {
    type: String,
    maxlength: 32,
  },
  email: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
  },
})
const ReservationSchema = new Schema(
  {
    tickets: [TicketSchema],
    customer: { type: CustomerSchema, require: true },
    language: {
      type: String,
      require: true,
      enum: [LANGUAGES.DE, LANGUAGES.IT, LANGUAGES.EN],
    },
    checkoutId: {
      type: String,
      require: true,
    },
    paymentMode: {
      type: String,
      require: true,
      enum: [PAYMENT.MODE.LIVE, PAYMENT.MODE.TEST],
    },
    paymentStatus: {
      type: String,
      require: true,
      enum: [PAYMENT.STATUS.SUCCESS, PAYMENT.STATUS.FAILED, PAYMENT.STATUS.PENDING],
    },
    transactions: { type: Array },
    bftHistory: { type: Array },
    totalAmount: {
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
    confirmedBy: {
      type: String,
    },
    bftSync: {
      type: Boolean,
    },
    confirmationMailsent:{
      type: Date
    },
    clientId: {
      type: String,
      require: true,
    },
    domainId: {
      type: String,
      require: true,
    },
    product: {
      type: String,
      require: true,
    },
  },
  { timestamps: true, versionKey: false, collection: 'parkingReservations' },
)

const ReservationModel = model('parkingReservations', ReservationSchema)

module.exports = ReservationModel
