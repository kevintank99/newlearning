
// REQUIRES ============================================================
const { Router } = require("express");
const { webhookController } = require("../controllers");

// CONSTANTS ===========================================================
const webhookRouter = new Router();

// REQUEST DEFINITIONS =================================================

webhookRouter.post("/hobex", webhookController.hobexWebhookConsumer);


// EXPORTS =============================================================
module.exports = webhookRouter;
