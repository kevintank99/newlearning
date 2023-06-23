// REQUIRES ===============================================================
const { lts } = require('../config')
const fetch = require('node-fetch')

/**
 * Authenticate Login
 * @param {string} username
 * @param {string} password
 * @returns
 */
const AuthLogin = async (username, password) => {
  const result = await fetch(`${lts.url}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  return result.json()
}

/**
 * Create Cart
 * @param {string} user
 * @param {string} languageCode
 * @returns
 */
const createCart = async (user, languageCode) => {
  const result = await fetch(`${lts.url}/shop/cart/create`, {
    method: 'POST',
    body: JSON.stringify({
      pos: {
        id: lts.posId,
      },
      cart: {
        operator: user,
        languageCode: languageCode,
        url: {
          success: 'https://www.myurl.domain/success',
          error: 'https://www.myurl.domain/error',
          aborted: 'https://www.myurl.domain/abort',
        },
      },
    }),
  })
  return await result.json()
}

/**
 * Get Cart
 * @param {string} cartRID
 * @returns
 */
const getCart = async (cartRID) => {
  const response = await fetch(`${lts.url}/shop/cart/get`, {
    method: 'POST',
    body: JSON.stringify({
      pos: {
        id: lts.posId,
      },
      cart: {
        rid: cartRID,
      },
    }),
  })
  return await response.json()
}

/**
 * Add Product
 * @param {string} cartRID
 * @param {string} dateRID
 * @param {number} quantity
 * @returns
 */
const addProductToCart = async (cartRID, dateRID, quantity) => {
  const response = await fetch(`${lts.url}/shop/cart/product/add`, {
    method: 'POST',
    body: JSON.stringify({
      pos: {
        id: lts.posId,
      },
      cart: {
        rid: cartRID,
        cartProduct: {
          product: {
            rid: lts.productRID,
            type: 0,
          },
          cartVariant: {
            variant: {
              rid: lts.variantRID,
            },
            dateRid: dateRID,
          },
          quantity: {
            value: quantity,
          },
        },
      },
    }),
  })
  return await response.json()
}

/**
 * Get Events
 * @param {string} rid
 * @param {string=} languageCode
 * @param {Date=} dateFrom
 * @param {Date=} dateTo
 * @returns
 */
const getEvents = async (rid, languageCode, dateFrom, dateTo) => {
  const response = await fetch(
    `${lts.url}/events/${rid}?${languageCode ? `&language=${languageCode}` : ''}${
      dateFrom ? `&dateFrom=${dateFrom}` : ''
    }${dateTo ? `&dateTo=${dateTo}` : ''}`,
    {
      method: 'GET',
    },
  )
  return await response.json()
}

/**
 * Set Attributes
 * @param {string} cartRID
 * @param {string} attributeRID
 * @param {string} attributeValue
 * @returns
 */
const setAttributes = async (cartRID, attributeRID, attributeValue) => {
  const response = await fetch(`${lts.url}/shop/cart/product/attribute/set`, {
    method: 'POST',
    body: JSON.stringify({
      "pos": {
        "id": lts.posId
      },
      "cart": {
        "rid": cartRID,
        "attributes": [
          {
            "cartProductRid": lts.productRID,
            "cartVariantRid": lts.variantRID,
            "attribute": {
              "rid": attributeRID,
              "value": attributeValue
            },
          }
        ]
      }
    })
  })
  return await response.json()
}

/**
 * Add User Profile
 * @param {string} cartRID
 * @param {string} firstname
 * @param {string} lastname
 * @param {string} email
 * @returns
 */
const addUserProfile = async (cartRID, firstname, lastname, email) => {
  const response = await fetch(`${lts.url}/shop/cart/user/add`, {
    method: 'POST',
    body: JSON.stringify({
      "pos": {
        "id": lts.posId
      },
      "cart": {
        "rid": cartRID
      },
      "profileUser": {
        "names": {
          "firstname": firstname,
          "lastname": lastname
        },
        "email": email
      }
    })
  })
  return await response.json()
}

/**
 * Checkout
 * @param {string} cartRID
 * @returns
 */
const checkout = async (cartRID) => {
  const response = await fetch(`${lts.url}/shop/payment/start?cartrid=${cartRID}&posid=${lts.posId}`, {
    method: 'GET', 
  })
  return await response.json()
}

// EXPORTS ================================================================
module.exports = {
  AuthLogin,
  createCart,
  getCart,
  addProductToCart,
  getEvents,
  setAttributes,
  addUserProfile,
  checkout
}
