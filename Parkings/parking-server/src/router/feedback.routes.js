// REQUIRES ============================================================
const { Router } = require('express')
const { feedbackController } = require('../controllers')

// CONSTANTS ===========================================================
const feedbackRouter = new Router()

// REQUEST DEFINITIONS =================================================
feedbackRouter.post('/add', feedbackController.addFeedback)
// EXPORTS =============================================================
module.exports = feedbackRouter
