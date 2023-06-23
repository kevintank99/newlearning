// REQUIRES ==============================================================
const { feedbackServices } = require('../services')

// CONTROLLERS ===========================================================
/**
 * GEnrate checkout id controller
 * @param {*} req
 * @param {*} res
 */

const addFeedback = async (req, res) => {
  try {
    const feedbackDetails = await feedbackServices.insertFeedback(req.body)
    res.json({ data: feedbackDetails, error: null })
  } catch (error) {
    console.log('Error', error)
    res.json({
      error: error,
    })
  }
}

// EXPORTS ================================================================
module.exports = {
  addFeedback,
}
