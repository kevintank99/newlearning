const puppeteer = require("puppeteer")

// const pdfBuilder = async ({ html, filename, width = 794, height = 1122, landscape = false }) => {
const pdfBuilder = async ({
  html = `Error while generating PDF.`,
  path = 'tickets',
  filename = 'MTS_Ticket.pdf',
  format = 'A4',
  pageRanges = '1',
  width = 794,
  height = 1122,
  landscape = false,
  printBackground = true,
}) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width, height },
  })
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 2 })
  await page.setContent(`<html>
    <head>
      <style>
        html,
        body {
          -webkit-print-color-adjust: exact;
          margin: 0 !important;
          padding: 0 !important;
        }
        body {
          width: 794px;
          height: 1122px;
          overflow: hidden;
        }
      </style>
    </head>
    <body>${html}</body>
  </html>`)
  const output = await page.pdf({
    path: `./${path}/${filename}`,
    format,
    pageRanges,
    landscape,
    printBackground,
  })
  await browser.close()

  return output
  // return 4
}

module.exports = {
    pdfBuilder
  }
