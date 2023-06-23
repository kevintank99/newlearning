
// REQUIRES ============================================================
const { Router } = require("express");
const { ltsController } = require("../controllers");

// CONSTANTS ===========================================================
const ltsRouter = new Router();
// REQUEST DEFINITIONS =================================================
ltsRouter.post("/sync", ltsController.synclts);

// EXPORTS =============================================================
module.exports = ltsRouter;
