
const INVENTORY ={
    VEHICLE: {
        CARTYPE : "CAR",
        MOTORBIKETYPE: 'MOTORBIKE',
        CAMPERTYPE: 'CAMPER',
        COACHTYPE: 'COACH',
        TRUCKTYPE: 'TRUCK'
    },
    TICKET: {
        DAILY : "daily",
    },
}
const PAYMENT = {
    MODE : {
        LIVE : "live",
        TEST : "test",
    },
    STATUS: {
        PENDING: "pending",
        SUCCESS: "success",
        FAILED: "failed",
        REVIEW: "review"
    }
}
const RESERVATION = {
   VEHICLESTATUS:{
    CHECKEDIN :"checkedin",
    CHECKEDOUT :"checkedout"
   },
   TICKETSTATUS:{
    CONFIRMED :"confirmed",
    CANCELED :"canceled",
   }
}

const LANGUAGES = {
    EN: 'en',
    DE: 'de',
    IT: 'it',
}

module.exports = {
    INVENTORY: INVENTORY,
    PAYMENT: PAYMENT,
    RESERVATION: RESERVATION,
    LANGUAGES: LANGUAGES,
}
