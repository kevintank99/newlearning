const { db } = require("../../config");
const { default: mongoose } = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(db.mongodbUrl, { useUnifiedTopology: true }, {useNewUrlParser: true});

mongoose.connection
    .once('open', () => console.log("Database connected"))
    .on('error', (error) => {
        console.log("Connection error", error);
    });
