// REQUIRES ==============================================================
const { ltsServices } = require('../services')
// CONTROLLERS ===========================================================

/**
 * Create Rates controller
 * @param {*} req
 * @param {*} res
 */
const synclts = async (req, res) => {
  try {
    const result = await ltsServices.AuthLogin('www.pragsparking.com', 'x6gist1s0Apiclth')
    res.json({
      data: { result },
      error: null,
    })
  } catch (error) {
    console.log(error)
    res.json({
      error: error,
    })
  }
}

// EXPORTS ================================================================
module.exports = {
  synclts,
}
