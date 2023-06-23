// *********** LOGGER MIDDLEWARE ***********

const logger = (req, res, next) => {

    const msg = `=== [ ${req.method} ] ${req.rawHeaders[1]} ${req.url}`;

    console.log("API", msg);

    next();

};



module.exports = logger;