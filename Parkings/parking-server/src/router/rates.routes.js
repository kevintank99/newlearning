
// REQUIRES ============================================================
const { Router } = require("express");
const { ratesController } = require("../controllers");

// CONSTANTS ===========================================================
const ratesRouter = new Router();
// REQUEST DEFINITIONS =================================================
ratesRouter.get("/get", ratesController.getRates);
ratesRouter.get("/gettodaysrate", ratesController.getTodaysRates);
ratesRouter.post("/add", ratesController.addRate);
ratesRouter.put("/addgaprate", ratesController.addGapRate);
ratesRouter.put("/updateslotrate", ratesController.updateSlotRate);
ratesRouter.delete("/removeslotrate", ratesController.deleteSlotRate);
// EXPORTS =============================================================
module.exports = ratesRouter;
