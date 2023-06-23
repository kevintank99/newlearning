const { appConfig } = require('../config')
// *********** AUTHENTIACTION MIDDLEWARE ***********

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization
  console.log({ authorization })

  if (authorization) {
    const token = authorization.split(' ')
    if (token[1] === appConfig.token) {
      authenticateDomain(req, res, next)
    } else {
      return res.status(401).json({ error: 'Not authorized', data: null })
    }
  } else {
    return res.status(401).json({ error: 'Not authorized', data: null })
  }
}
// List of allowed domains
const allowedDomains = [
  'localhost',
  '10.10.10.119',
  'parking-test.mts-online.com',
  'parking.mts-online.com',
  'u.mts-online.com',
  'www.lagodibraies.com',
  'lagodibraies.com',
]

// Middleware function to authenticate domains
const authenticateDomain = async (req, res, next) => {
  const requestHostname = req.hostname

  if (allowedDomains.includes(requestHostname)) {
    next()
  } else {
    console.log('req.hostname', req.hostname)
    // The domain is not allowed, so send a 403 Forbidden response
    res.status(403).send({ error: 'Access denied', data: null })
  }
}

// EXPORTS =================================================================
module.exports = authMiddleware
