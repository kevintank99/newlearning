// REQUIRES ===============================================================
const { hobex, client } = require('../config')
const { createBodyString } = require('../utils/utils')
const fetch = require('node-fetch')

// SERVICES ===============================================================
/**
 * Create Checkout
 * @param {object} query
 * @returns
 */
const createCheckout = async ({ amount, options }) => {
  const bodyString = createBodyString({
    entityId: hobex.entityId,
    amount: amount,
    currency: options?.currency || 'EUR',
    paymentType: 'DB',
    'customParameters[SHOPPER_module]': 'PragserParking',
    'customParameters[SHOPPER_version]': '2',
    'customParameters[SHOPPER_clientId]': client.clientId,
    'customParameters[SHOPPER_domain]': client.domainId,
    'customParameters[SHOPPER_product]': client.product,
  })
  // let { default: fetch } = await import('node-fetch')
  const transaction = await fetch(hobex.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${hobex.password}`,
    },
    body: bodyString,
  })
  return await transaction.json()
}
/**
 * Get Checkout Status
 * @param {string} checkoutId
 * @returns
 */
const checkCheckoutStatus = async (checkoutId) => {
  const result = await fetch(`${hobex.url}/${checkoutId}/payment?entityId=${hobex.entityId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${hobex.password}`,
    },
  })
  return await result.json()
}

/**
 * Cancel Checkout
 * @param {object} query
 * @returns
 */
const cancelCheckout = async ({ id, amount, options }) => {
  const bodyString = createBodyString({
    entityId: hobex.entityId,
    amount: amount,
    currency: options?.currency || 'EUR',
    paymentType: 'RF',
  })
  // let { default: fetch } = await import('node-fetch')
  const transaction = await fetch(`https://eu-test.oppwa.com/v1/payments/${id}`, {
    method: 'POST',
    // port: 443,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': bodyString.length,
      Authorization: `Bearer ${hobex.password}`,
    },
    body: bodyString,
  })
  const res = await transaction.json()
  return res
}

// EXPORTS ================================================================
module.exports = {
  createCheckout,
  checkCheckoutStatus,
  cancelCheckout,
}
