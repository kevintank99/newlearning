
// REQUIRES ============================================================
const { Router } = require("express");
const { reservationController } = require("../controllers");

// CONSTANTS ===========================================================
const ReservationRouter = new Router();
// REQUEST DEFINITIONS =================================================
ReservationRouter.get("/get", reservationController.getReservations);
ReservationRouter.get("/getreservation", reservationController.getReservation);
ReservationRouter.post("/otpVerification", reservationController.otpVerification);
ReservationRouter.get("/getreservationcounts", reservationController.getRangeBasedReservations);
ReservationRouter.get("/getcheckoutcounts", reservationController.getRangeBasedCheckouts);
ReservationRouter.get("/checkslotavailability", reservationController.checkParkingSlotAvailable);
ReservationRouter.get("/getavailability", reservationController.getAvailability);
ReservationRouter.get("/getcalendar", reservationController.getCalendarData);
ReservationRouter.post("/add", reservationController.addReservation);
ReservationRouter.get("/gettoday", reservationController.getTodaysReservations);
ReservationRouter.post("/checkstatus", reservationController.checkReservationStatus);
ReservationRouter.put("/update", reservationController.updateReservation);
ReservationRouter.put("/updateticket", reservationController.updateTicket);
ReservationRouter.post("/cancelticket", reservationController.cancelTicket);

// EXPORTS =============================================================
module.exports = ReservationRouter;
