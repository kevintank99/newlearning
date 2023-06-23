
// REQUIRES ============================================================
const { Router } = require("express");
const { mailerController } = require("../controllers");

// CONSTANTS ===========================================================
const mailerRouter = new Router();

// REQUEST DEFINITIONS =================================================
mailerRouter.post("/reservation/:checkoutId", mailerController.sendReservationMail);


// EXPORTS =============================================================
module.exports = mailerRouter;
