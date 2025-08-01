import puppeteer from 'puppeteer'
import { addExtra } from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'

// Workaround, see https://github.com/berstend/puppeteer-extra/issues/93#issuecomment-712364816
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import ChromeAppPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.app'
import ChromeCsiPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi'
import ChromeLoadTimes from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes'
import ChromeRuntimePlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime'
import IFrameContentWindowPlugin from 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow'
import MediaCodecsPlugin from 'puppeteer-extra-plugin-stealth/evasions/media.codecs'
import NavigatorLanguagesPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages'
import NavigatorPermissionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions'
import NavigatorPlugins from 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins'
import NavigatorVendor from 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor'
import NavigatorWebdriver from 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver'
import SourceUrlPlugin from 'puppeteer-extra-plugin-stealth/evasions/sourceurl'
import UserAgentOverridePlugin from 'puppeteer-extra-plugin-stealth/evasions/user-agent-override'
import WebglVendorPlugin from 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor'
import WindowOuterDimensionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions'

// Configure puppeteer-extra plugins
const puppeteerExtra = addExtra(puppeteer)
const plugins = [
	AdblockerPlugin({ blockTrackers: true }),
	StealthPlugin(),
	ChromeAppPlugin(),
	ChromeCsiPlugin(),
	ChromeLoadTimes(),
	ChromeRuntimePlugin(),
	IFrameContentWindowPlugin(),
	MediaCodecsPlugin(),
	NavigatorLanguagesPlugin(),
	NavigatorPermissionsPlugin(),
	NavigatorPlugins(),
	NavigatorVendor(),
	NavigatorWebdriver(),
	SourceUrlPlugin(),
	UserAgentOverridePlugin(),
	WebglVendorPlugin(),
	WindowOuterDimensionsPlugin()
]

// Build launch options based on environment variables
export const getOptions = () => {
	const options = { headless: true }
	if (process.env.PUPPETEER_EXECUTABLE_PATH) {
		options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
	}
	return options
}

export const getPdf = async (url) => {

	// Start headless browser instance
	const options = getOptions()
	const browser = await puppeteerExtra.launch(options)

	// Load all plugins manually
	for (const plugin of plugins) {
		await plugin.onBrowser(browser)
	}

	const page = await browser.newPage()

	// Visit URL and wait until everything is loaded (available events: load, domcontentloaded, networkidle0, networkidle2)
	await page.goto(url, { waitUntil: 'networkidle2', timeout: 8000 })

	// Scroll to bottom of page to force loading of lazy loaded images
	await page.evaluate(async () => {
		await new Promise((resolve) => {
			let totalHeight = 0
			const distance = 100
			const timer = setInterval(() => {
				const scrollHeight = document.body.scrollHeight
				window.scrollBy(0, distance)
				totalHeight += distance

				if (totalHeight >= scrollHeight) {
					clearInterval(timer)
					resolve()
				}
			}, 5)
		})
	})

	// Tell the browser to generate the PDF
	await page.emulateMediaType('screen')
	const buffer = await page.pdf({
		format: 'A4',
		displayHeaderFooter: true,
		headerTemplate: '',
		footerTemplate: '',
		printBackground: true
	})

	// Close browser instance
	await browser.close()

	return buffer
}