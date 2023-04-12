const xpaths = {
  Price: `//span[@class='price-2']`,
  CarFullTitle: `//h1[@class='i10r_detailVehicleTitle']/child::a/text()[normalize-space()]`,
  Kilometers: `//p[@class='i10r_optMPG']`,
  Transmission: `//p[@class='i10r_optTrans']`,
  Engine: `//p[@class='i10r_optEngine']`,
  Trim: `//span[@class='vehicleTrim']`,
  DriveType: `//p[@class='i10r_optDrive']`,
  Vin: `//p[@class='i10r_optVin']`,
  ExteriorColor: `//p[@class='i10r_optColor']`,
  InteriorColor: `//p[@class='i10r_optInteriorColor']`,
  FuelType: ``,
  FuelEconomy: `//p[@class='i10r_optFuelEco']/label/following-sibling::text() `,
  StockNumber: `//p[@class='i10r_optStock']`,
  pictures: `//div[@class="carousel-item"]`,
  SellerComments: `//div[@class="card-body"]`,
};

const puppeteer = require('puppeteer');
const new_items = require('./items');
const fs = require('fs');
const path = require('path');
var json2csv = require('json2csv').parse;

//url
const base_uri = 'https://www.magnesauto.com';

(async function run() {
  //custom path for storing the cookies
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(`${base_uri}/newandusedcars`);

  // const select = page.$x(`//select[@aria-label='Page Size']`);
  // await select.click();

  // const value = page.$x(`//option[@value='50']`);
  // await value.click();

  // wait for 10 seconds
  await page.waitForTimeout(10000);

  // do something else after waiting

  //get all the urls of product from 1 page
  const urls = await getUrls(page);
  console.log(urls.length);

  for (let i = 0; i < urls.length; i++) {
    const uri = base_uri + urls[i].url;
    //Every Url is now availabe for each page

    //in this array we will store details of one car
    let items = [];

    await page.goto(uri, { waitUntil: 'networkidle2' });
    let item = new_items;

    item.url = uri;

    //get price from xpath
    try {
      let [data] = await page.$x(xpaths.Price);
      new_data = await page.evaluate((el) => el.innerText, data);
      item.Price = sanitizeInt(new_data);
    } catch (error) {}

    //get Year , Make model1 , Make model 2 from xpath
    try {
      let [data] = await page.$x(xpaths.CarFullTitle);
      new_data = await page.evaluate((el) => {
        const carFullTitle = el.textContent.trim();
        let [Year, MakeModel1, ...MakeModel2] = carFullTitle.split(' ');
        MakeModel2 = MakeModel2.join(' ');
        return [Year, MakeModel1, MakeModel2];
      }, data);
      let [Year, MakeModel1, MakeModel2] = new_data;

      item.Year = sanitizeInt(Year);
      item.MakeModel1 = sanitizeString(MakeModel1);
      item.MakeModel2 = sanitizeString(MakeModel2);
    } catch (error) {}

    //get Kilometers from xpath
    try {
      let [data] = await page.$x(xpaths.Kilometers);
      data = await page.evaluate((el) => el.textContent, data);
      item.Kilometers = sanitizeInt(data);
    } catch (error) {}

    //get Transmission from xpath
    try {
      let [data] = await page.$x(xpaths.Transmission);
      data = await page.evaluate((el) => el.textContent, data);
      data = data.split(':')[1];
      item.Transmission = sanitizeString(data);
    } catch (error) {}

    //get Engine from xpath
    try {
      let [data] = await page.$x(xpaths.Engine);
      data = await page.evaluate((el) => el.textContent, data);
      let [engineSize, ...engineType] = data.split(':')[1].split(' ').slice(1);
      engineType = engineType.join(' ');
      item.Engine = engineSize;
      item.EngineSize = engineType;
    } catch (error) {}

    //get Trim from xpath
    try {
      let [data] = await page.$x(xpaths.Trim);
      data = await page.evaluate((el) => el.textContent, data);
      item.Trim = sanitizeString(data);
    } catch (error) {}

    //get Drive Type from xpath
    try {
      let [data] = await page.$x(xpaths.DriveType);
      data = await page.evaluate((el) => el.textContent, data);
      data = data.split(':')[1];
      item.DriveType = sanitizeString(data);
    } catch (error) {}

    //get Vin from xpath
    try {
      let [data] = await page.$x(xpaths.Vin);
      data = await page.evaluate((el) => el.textContent.trim(), data);
      data = data.split(':')[1];

      item.Vin = sanitizeString(data);
    } catch (error) {}

    //get Exterior Color from xpath
    try {
      let [data] = await page.$x(xpaths.ExteriorColor);
      data = await page.evaluate((el) => el.textContent, data);
      data = data.split(':')[1];
      item.ExteriorColor = sanitizeString(data);
    } catch (error) {}

    //get Interior Color from xpath
    try {
      let [data] = await page.$x(xpaths.InteriorColor);
      data = await page.evaluate((el) => el.textContent, data);
      data = data.split(':')[1];
      item.InteriorColor = sanitizeString(data);
    } catch (error) {}

    //get Stock from xpath
    try {
      let [data] = await page.$x(xpaths.StockNumber);
      data = await page.evaluate((el) => el.textContent, data);
      data = data.split(':')[1];
      item.StockNumber = sanitizeInt(data);
    } catch (error) {}

    //get City and Highway Fuel Economy from xpath
    try {
      let [data] = await page.$x(xpaths.FuelEconomy);
      data = await page.evaluate((el) => el.textContent, data);
      let [city, hwy] = data.split('/');
      city = city.split(' ')[2];
      hwy = hwy.split(' ')[1];
      item.CityFuelEconomy = sanitizeString(city);
      item.HwyFuelEconomy = sanitizeString(hwy);
    } catch (error) {}

    //get Seller Comments from xpath
    try {
      const text = await page.evaluate(() => {
        const divs = document.querySelectorAll('.card-body');
        let firstText;

        for (let i = 0; i < divs.length; i++) {
          const text = divs[i].textContent.trim();
          firstText = text;
          break;
        }
        return firstText;
      });
      item.SellerComments = sanitizeString(text);
    } catch (error) {}

    //fetch all images src
    try {
      // let imgs = await page.$x(xpaths.pictures);

      // let imgSrcs = await page.evaluate(() => {
      //   let results = [];
      //   let items = document.querySelectorAll('.carousel-item img');
      //   items.forEach((item) => {
      //     results.push(item.getAttribute('src'));
      //   });
      //   return results;
      // });

      const imgSrcs = await page.$$eval('.carousel-item img', (imgs) =>
        imgs.map((img) => img.getAttribute('data-src'))
      );

      // let imgSrcs = await Promise.all(
      //   imgs.map(async (img) => {
      //     return await page.evaluate((el) => el.src, img);
      //   })
      // );

      if (imgSrcs.length > 0) {
        //move first image to last in index
        imgSrcs.push(imgSrcs.shift());
      }
      imgSrcs = [...new Set(imgSrcs)];
      let imgSrcsString = imgSrcs.join([(separator = ';')]);
      console.log(imgSrcs);
      item.pictures = imgSrcsString.startsWith('data') ? '' : imgSrcsString;
    } catch (error) {}

    items.push(item);
    if (items.length > 0) {
      //add items to csv
      await write(Object.keys(items), items, `Magnes_Auto.csv`);
    }
    console.log(`${i + 1} Product Done`);
  }

  console.log(`website Done`);
  browser.close();
})();

const getUrls = async (page) => {
  let urls = await page.evaluate(() => {
    let results = [];
    //it'll give all the links for cars
    let items = document.querySelectorAll('.i10r_vehicleTitle > a');
    //to get the href from a tags
    items.forEach((item) => {
      results.push({
        url: item.getAttribute('href'),
        text: item.innerText,
      });
    });

    return results;
  });
  console.log(urls);
  console.log(urls.length);

  return urls;
};

function sanitizeString(str) {
  //remove \t and \n
  str = str.replace(/(\r\n|\n|\r|\t)/gm, '');
  //remove multiple spaces
  str = str.replace(/\s+/g, ' ');
  //remove leading and trailing spaces
  str = str.trim();
  return str;
}

function sanitizeInt(num) {
  num = num.replace(/[^0-9]/g, '');
  return num;
}

async function write(headersArray, dataJsonArray, fname) {
  const filename = path.join(__dirname, `${fname}`);
  let rows;
  // If file doesn't exist, we will create new file and add rows with headers.
  if (!fs.existsSync(filename)) {
    rows = json2csv(dataJsonArray, { header: true });
  } else {
    // Rows without headers.
    rows = json2csv(dataJsonArray, { header: false });
  }

  // Append file function can create new file too.
  fs.appendFileSync(filename, rows);
  // Always add new line if file already exists.
  fs.appendFileSync(filename, '\r\n');
}
