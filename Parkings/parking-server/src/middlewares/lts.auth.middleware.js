const { lts } = require('../config')
const fetch = require('node-fetch')
// *********** AUTHENTIACTION MIDDLEWARE ***********

let token = null
let tokenExpiration = null

const authenticate = async (req, res, next) => {
  // Check if the token is already available and not expired
  try {
    if (token && tokenExpiration && tokenExpiration > Date.now()) {
      req.headers.authorization = `Bearer ${token}`
      next();
    } else {
      // Call the /auth endpoint to get a new token
      const response = await fetch(`${lts.url}/reservations/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username: lts.username, password: lts.password }),
      })
      console.log(response)
      const { success, jwtToken } = response.data.meta

      if (success && jwtToken) {
        token = jwtToken.token
        tokenExpiration = Date.now() + jwtToken.expireSeconds * 1000

        req.headers.authorization = `Bearer ${token}`
        next()
      } else {
        return res.status(401).json({ message: 'Authentication failed' })
      }
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// EXPORTS =================================================================
module.exports = authenticate
