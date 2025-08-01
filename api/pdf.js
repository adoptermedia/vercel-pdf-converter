const puppeteer = require('puppeteer')

module.exports = async (req, res) => {
  const target = req.query.url
  if (!target) return res.status(400).send('Missing url parameter')

  let browser
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 10000 })
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()
    res.setHeader('Content-Type', 'application/pdf')
    return res.send(pdf)
  } catch (err) {
    if (browser) await browser.close()
    console.error(err)
    return res.status(500).send('Error generating PDF')
  }
}
