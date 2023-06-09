import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

// Add stealth plugin and use defaults 
import {executablePath} from 'puppeteer';

puppeteer.use(pluginStealth());

const app = express()
const port = 2323

app.use(cors())
app.use(bodyParser.json({limit: '5000mb'}))

app.post('/', async (req, res) => {
  if (!req.body.input) {
    res.send('500');
    return;
  }

  const browser = await puppeteer.launch({ headless:true, executablePath: executablePath() });
  const page = await browser.newPage();

  await page.goto('https://translate.google.com/?hl=vi&tab=TT&sl=auto&tl=vi&op=images');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024 });

  const elemInputFile = await page.$("#ucj-11");

  let inputImg = Buffer.from(req.body.input.replace(/^data:image\/png;base64,/, ""), 'base64');

  const inputImgName = Date.now() + '.png'

  fs.writeFileSync(inputImgName, inputImg);

  await elemInputFile.uploadFile(inputImgName);

  await page.waitForSelector('img.Jmlpdc', {
    timeout: 5000
  });

  fs.unlinkSync(inputImgName)

  const elemOutputImgSrc = await page.$$eval('.Jmlpdc:last-child', elems => elems[1].getAttribute('src'));
  const elemOutputImgAlt = await page.$$eval('.Jmlpdc:last-child', elems => elems[1].getAttribute('alt'));

  const page1 = await browser.newPage();
  const imageResponse = await page1.goto(elemOutputImgSrc);

  const imageBuffer = await imageResponse.buffer();

  // await fs.promises.writeFile('./test_output.png', imageBuffer)

  await browser.close();

  res.send({
    output: 'data:image/png;base64,' + imageBuffer.toString('base64'),
    text: elemOutputImgAlt
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})