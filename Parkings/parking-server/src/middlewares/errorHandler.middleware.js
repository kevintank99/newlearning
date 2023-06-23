
// REQUIRES ================================================================
const { RESPONSE } = require("../constants/app.constants");
const { errorLog } = require("../models");
// METHODS =================================================================
const errorHandlerMiddleware = async (err, req, res, next) => {
  // let storeJson = "";
  // try {
  //   storeJson = JSON.stringify(err);
  // } catch (data) {
  //   console.log("DATA===================================", data);
  //   storeJson = err;
  // }
  // console.log("errr======================================", err);
  // const errData = new errorLog({ log: storeJson });
  // errData.save();
  return res.send({
    response_code: err.code,
    error: {
      code: err.code,
      message: err.message,
      field: err.field,
      type: err.type,
    },
  });
};

// EXPORTS =================================================================
module.exports = errorHandlerMiddleware;
