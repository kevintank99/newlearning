/**
 * Requires
 */
const { appConfig } = require("./src/config");
const express = require("express");
const http = require("http");
const cors = require("cors");
const router = require("./src/router");
const db = require("./src/includes/mongoose");

const {
  errorHandlerMiddleware,
  loggerMiddleware,
  authMiddleware
} = require("./src/middlewares");

const app = express();
const server = http.createServer(app);
app.use(cors());

const path = require('path');
const qrcodeImages = path.join(__dirname, 'qrcodes');
app.use(express.static(qrcodeImages));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
// app.use(authMiddleware)
app.use(`/api/${appConfig.apiVersion}`, router);
app.use(errorHandlerMiddleware);

/**
 * Server Initiation
 */

server.listen(appConfig.port, () => {
  console.info(
    `${appConfig.project} service is listening to the port ${appConfig.port}.`
  );
});
