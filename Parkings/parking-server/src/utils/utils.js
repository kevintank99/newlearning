const { PAYMENT } = require('../constants/app.constants')
/**
 * Date Convertor
 * @param {Date | number} date
 * @param {"time" | "date" | "ddmmyyyy"} format
 * @param {"start" | "end" | "beginningOfMonth" | "endOfMonth"} type
 * @returns {int | Date | string}
 */
const DateConvertor = (date, format, type) => {
  switch (format) {
    case 'time':
      return new Date(convertTime(date, type)).getTime()
    case 'date':
      return new Date(convertTime(date, type))
    case 'ddmmyyyy':
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());
      return `${day}/${month}/${year}`;
    default:
      return date
  }
}

// const convertTime = (date, type)=>{
//     const d = new Date(date)
//     if(type==="start") {
//         d.setHours(0)
//         d.setMinutes(0)
//         d.setSeconds(0)
//     }
//     else if(type==="end") {
//         d.setHours(23)
//         d.setMinutes(59)
//         d.setSeconds(59)
//     }
//     return d
// }
/**
 * Convert Time to start of date or end
 * @param {Date | number} date
 * @param {"start" | "end" | "beginningOfMonth" | "endOfMonth"} type
 * @returns {date}
 */
const convertTime = (date, type) => {
  const d = new Date(date)
  const timezoneOffset = d.getTimezoneOffset()
  if (type === 'start') {
    d.setUTCHours(0)
    d.setUTCMinutes(0)
    d.setUTCSeconds(0)
  } else if (type === 'end') {
    d.setUTCHours(23)
    d.setUTCMinutes(59)
    d.setUTCSeconds(59)
  } else if (type === 'beginningOfMonth') {
    d.setDate(1)
    d.setHours(0)
    d.setMinutes(0)
    d.setSeconds(0)
  } else if (type === 'endOfMonth') {
    d.setDate(1) // Avoids edge cases on the 31st day of some months
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    d.setHours(23)
    d.setMinutes(59)
    d.setSeconds(59)
  }

  return d
}

/**
 * Define a function to generate a random n-digit code
 * @param {int} n
 * @returns {date}
 */
function genrateRandomCode(n) {
  // Generate a random number between 0 and 999999
  let code = Math.floor(Math.random() * 1000000)
  // Convert the number to a string and pad it with leading zeros if necessary
  code = code.toString().padStart(n, '0')
  // Return the code
  return code
}

/**
 * Create Bodystring
 * @param {Object} options
 * @returns {string}
 */
const createBodyString = (options) =>
  Object.entries(options).reduce((acc, [key, value], i) => {
    return `${acc}${key}=${value}${Object.entries(options).length !== i + 1 ? '&' : ''}`
  }, '')

const getHobexPaymentStatus = (code) => {
  const paymentSuccess = /^(000.000.|000.100.1|000.[36]|000.400.[1][12]0)/.test(code)
  const paymentReview = /^(000.400.0[^3]|000.400.100)/.test(code)
  const paymentPending = /^(000\.200)/.test(code) || /^(800\.400\.5|100\.400\.500)/.test(code)
  const paymentFailed =
    /^(000\.400\.[1][0-9][1-9]|000\.400\.2)/.test(code) ||
    /^(800\.[17]00|800\.800\.[123])/.test(code) ||
    /^(900\.[1234]00|000\.400\.030)/.test(code) ||
    /^(800\.[56]|999\.|600\.1|800\.800\.[84])/.test(code) ||
    /^(100\.39[765])/.test(code) ||
    /^(300\.100\.100)/.test(code) ||
    /^(100\.400\.[0-3]|100\.38|100\.370\.100|100\.370\.11)/.test(code) ||
    /^(800\.400\.1)/.test(code) ||
    /^(800\.400\.2|100\.380\.4|100\.390)/.test(code) ||
    /^(100\.100\.701|800\.[32])/.test(code) ||
    /^(800\.1[123456]0)/.test(code) ||
    /^(600\.[23]|500\.[12]|800\.121)/.test(code) ||
    /^(100\.[13]50)/.test(code) ||
    /^(100\.250|100\.360)/.test(code) ||
    /^(700\.[1345][05]0)/.test(code) ||
    /^(200\.[123]|100\.[53][07]|800\.900|100\.[69]00\.500)/.test(code) ||
    /^(100\.800)/.test(code) ||
    /^(100\.[97]00)/.test(code) ||
    /^(100\.100|100.2[01])/.test(code) ||
    /^(100\.55)/.test(code) ||
    /^(100\.380\.[23]|100\.380\.101)/.test(code) ||
    /^(000\.100\.2)/.test(code)
  if (paymentSuccess) {
    return PAYMENT.STATUS.SUCCESS
  } else if (paymentPending) {
    return PAYMENT.STATUS.PENDING
  } else if (paymentFailed) {
    return PAYMENT.STATUS.FAILED
  } else if (paymentReview) {
    return PAYMENT.STATUS.REVIEW
  } else {
    return ''
  }
}

/**
 * Create Bodystring
 * @param {*} data Inventory data
 * @param {Date | number} startDate startDate
 * @param {Date | number} endDate endDate
 * @returns
 */
const convertToRangeBasedInventory = (data, startDate, endDate)=>{
  const availabilityMap = {};

  // Iterate over each object in the data array
  for (const obj of data) {

      const objStartDate = new Date(obj.startDate);
      const objEndDate = new Date(obj.endDate);
      const numberOfVehicle = obj.numberOfVehicle;

      // Check if the object's date range overlaps with the specified date range
      if (objStartDate <= endDate && objEndDate >= startDate) {
        // Calculate the start and end dates within the specified date range
        const rangeStartDate = objStartDate < startDate ? startDate : objStartDate;
        const rangeEndDate = objEndDate > endDate ? endDate : objEndDate;

        // Add or update the available numberOfVehicle for each date within the range
        const currentDate = new Date(rangeStartDate);
        while (currentDate <= rangeEndDate) {
          const formattedDate = DateConvertor(currentDate, "ddmmyyyy");
          availabilityMap[formattedDate] = (availabilityMap[formattedDate] || 0) + numberOfVehicle;
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
  }

  return availabilityMap;
}

/**
 * Add days to a date
 * @param {Date | number} date date
 * @param {number} days days to add
 * @returns
 */
const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


  /**
 * to convert slot prices into day-wise price list
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {any[]} prices
 * @returns
 */
const priceConvertor = (startDate, endDate, prices) => {
  // Convert the input dates to JavaScript Date objects
  startDate = new Date(startDate)
  endDate = new Date(endDate)

  // Create an array to hold the result
  let result = []

  // Loop through each day between the start and end dates
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    // Find the price for the current day
    let amount = null
    let serviceAmount = null
    for (let i = 0; i < prices.length; i++) {
      let priceStartDate = new Date(prices[i].startDate)
      let priceEndDate = new Date(prices[i].endDate)
      if (d >= priceStartDate && d <= priceEndDate) {
        amount = prices[i].amount
        serviceAmount = prices[i].serviceAmount
        break
      }
    }

    // If no price is found for the current day, skip it
    if (amount === null) {
      amount = null
    }

    // Add the price for the current day to the result array
    result.push({
      date: DateConvertor(d, "ddmmyyyy"),
      amount: amount,
      serviceAmount: serviceAmount,
      id: prices.find((p) => p.amount === amount)?.id,
    })
  }
  return result
}
/**
 * to add gap slot prices into slot-wise price list
 * @param {any[]} prices
 * @returns
 */
const addGapSlots = (prices) => {
  // Create an array to hold the result
  let result = []

  // Loop through each price slot in the input array
  for (let i = 0; i < prices.length; i++) {
    let priceStartDate = new Date(prices[i].startDate)
    let priceEndDate = new Date(prices[i].endDate)
    let amount = prices[i].amount
    let id = prices[i].id

    // Add the current price slot to the result array
    result.push({
      startDate: priceStartDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      endDate: priceEndDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      amount: amount,
      id: id,
    })

    // Check for any gap slots between the current and next price slots
    if (i < prices.length - 1) {
      let nextPriceStartDate = new Date(prices[i + 1].startDate)
      let gapStartDate = new Date(priceEndDate.getTime() + 1000) // Add one second to avoid overlapping with the current slot
      let gapEndDate = new Date(nextPriceStartDate.getTime() - 1000) // Subtract one second to avoid overlapping with the next slot

      // If there is a gap slot between the current and next price slots, add it to the result array
      if (gapEndDate >= gapStartDate) {
        result.push({
          startDate: gapStartDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          endDate: gapEndDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          amount: null,
          id: null,
        })
      }
    }
  }
  return result
}



module.exports = {
  DateConvertor,
  convertTime,
  genrateRandomCode,
  createBodyString,
  getHobexPaymentStatus,
  convertToRangeBasedInventory,
  addDays,
  priceConvertor,
  addGapSlots
}
