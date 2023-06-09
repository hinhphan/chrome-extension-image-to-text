import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

// Add stealth plugin and use defaults 
import {executablePath} from 'puppeteer';

puppeteer.use(pluginStealth());

(async () => {
  const browser = await puppeteer.launch({ headless:true, executablePath: executablePath() });
  const page = await browser.newPage();

  // Wait for a random time before navigating to a new web page 
	// await page.waitForTimeout((Math.floor(Math.random() * 12) + 5) * 1000) 

  // Add Headers 
	// await page.setExtraHTTPHeaders({ 
	// 	'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 
	// 	'upgrade-insecure-requests': '1', 
	// 	'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
	// 	'accept-encoding': 'gzip, deflate, br', 
	// 	'accept-language': 'en-US,en;q=0.9,en;q=0.8' 
	// });

  await page.goto('https://translate.google.com/?hl=vi&tab=TT&sl=ja&tl=vi&op=images');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024 });

  const elemInputFile = await page.$("#ucj-11");

  await elemInputFile.uploadFile('test.png');

  await page.waitForSelector('img.Jmlpdc', {
    timeout: 5000
  });

  const elemOutputImgSrc = await page.$$eval('.Jmlpdc:last-child', elems => elems[1].getAttribute('src'));
  // const elemOutputImgSrc = await page.$$eval('.Jmlpdc:last-child', elems => elems[1].getAttribute('alt'));

  const page1 = await browser.newPage();
  const imageResponse = await page1.goto(elemOutputImgSrc);

  const imageBuffer = await imageResponse.buffer();

  await fs.promises.writeFile('./test_output.png', imageBuffer)

  setTimeout(() => {
    browser.close();
  }, 5000);
})();