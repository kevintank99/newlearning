
// REQUIRES ============================================================
const router = new require('express').Router({mergeParams: true})
const inventoryRouter = require('./inventory.routes')
const ratesRouter = require('./rates.routes')
const reservationRouter = require('./reservation.routes')
const feedbackRouter = require('./feedback.routes')
const webhookRouter = require('./webhook.routes')
const mailerRouter = require('./mailer.routes')
const ltsRouter = require('./lts.routes')
// const apiAuthMiddleware = require('../middlewares/apiAuth.middleware')

// ROUTER USES =========================================================
// router.use(apiAuthMiddleware) // REQUESTS BELOW HERE REQUIRE AUTHENTICATION.
router.use('/:clientId/inventory', inventoryRouter)
router.use('/:clientId/rates', ratesRouter)
router.use('/reservation', reservationRouter)
router.use('/feedback', feedbackRouter)
router.use('/webhook', webhookRouter)
router.use('/mailer', mailerRouter)
router.use('/lts', ltsRouter)

// EXPORTS =============================================================
module.exports = router
