require('dotenv').config()

const ENV_VARS = {
  appConfig: {
    port: process.env.PORT,
    apiVersion: process.env.API_VERSION,
    project: process.env.PROJECT_NAME,
    token: process.env.TOKEN,
  },
  db: {
    mongodbUrl: process.env.MONGO_DB_URL,
  },
  hobex: {
    url: process.env.HOBEX_URL,
    entityId: process.env.HOBEX_ENTITY_ID,
    password: process.env.HOBEX_PASSWORD,
  },
  bft: {
    url: process.env.BFT_URL,
    headersKey: process.env.BFT_HEADERS_KEY,
    headersValue: process.env.BFT_HEADERS_VALUE,
  },
  lts: {
    url: process.env.LTS_URL,
    headersKey: process.env.LTS_HEADERS_KEY,
    username: process.env.LTS_USERNAME,
    password: process.env.LTS_PASSWORD,
    posId: process.env.LTS_POSID,
    productRID: process.env.LTS_PRODUCT_RID,
    variantRID: process.env.LTS_VARIANT_RID,
  },
  client: {
    clientId: process.env.CLIENT_ID,
    domainId: process.env.DOMAIN_ID,
    product: process.env.PRODUCT,
  },
  mail:{
    from : process.env.MAIL_FROM,
    host : process.env.MAIL_HOST,
    port : process.env.MAIL_PORT,
    user : process.env.MAIL_USER,
    password : process.env.MAIL_PASSWORD,
  },
  domain: process.env.DOMAIN_URL
}
module.exports = ENV_VARS
