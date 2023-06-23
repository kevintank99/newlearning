// REQUIRES ===============================================================
const { FeedbackModel } = require('../models')
// SERVICES ===============================================================
/**
 * Insert Feedback
 * @param {*} body
 * @returns
 */
const insertFeedback = async (body) => {
  const feedbackData = new FeedbackModel(body)
  return await feedbackData.save()
}
// EXPORTS =================================================================
module.exports = {
  insertFeedback,
}
