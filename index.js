const xpaths = {
  Price: `//p[contains(text(),"$")]`,
  Year: `//span[contains(text(),"Year")]/following-sibling::span`,
  MakeModel1: `//span[contains(text(),"Make")]/following-sibling::span`,
  MakeModel2: `//span[contains(text(),"Model")]/following-sibling::span`,

  Kilometers: `//span[contains(text(),"Odometer")]/following-sibling::span`,

  Transmission: `//span[contains(text(),"Transmission")]/following-sibling::span']`,

  Engine: `//span[contains(text(),"Engine")]/following-sibling::span`,

  EngineSize: `//span[contains(text(),"Engine Size")]/following-sibling::span`,

  Trim: `//p[contains(@class,"DetaileProductCustomrWeb-title")]`,
  CityFuelEconomy: `//span[contains(text(),"City Fuel")]/following-sibling::span`,

  HwyFuelEconomy: `//span[contains(text(),"Highway Fuel")]/following-sibling::span`,

  DriveType: `//span[contains(text(),"Drivetrain")]/following-sibling::span`,

  ExteriorColor: `//span[contains(text(),"Exterior Color")]/following-sibling::div/child::span`,

  InteriorColor: `//span[contains(text(),"Interior Color")]/following-sibling::div/child::span`,

  Doors: `//span[contains(text(),"Doors")]/following-sibling::span`,

  StockNumber: `//span[contains(text(),"Stock Number")]/following-sibling::span`,

  FuelType: `//span[contains(text(),"Fuel Type")]/following-sibling::span`,
  Vin: `//span[contains(text(),"Vin")]/following-sibling::span`,
  pictures: `//img[@class='image-gallery-thumbnail-image']`,
};

const puppeteer = require('puppeteer');
const new_items = require('./items');
const fs = require('fs');
const path = require('path');
var json2csv = require('json2csv').parse;

//url
const url = 'https://apnamotors.com/cars';

(async function run() {
  const base_uri = `https://apnamotors.com`;
  //custom path for storing the cookies
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);

  //get all the urls of product from 1 page
  const urls = await getUrls(page);

  for (let i = 0; i < urls.length; i++) {
    const uri = base_uri + urls[i].url;
    console.log(uri);
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

    //get Year from xpath
    try {
      let [data] = await page.$x(xpaths.Year);
      data = await page.evaluate((el) => el.innerText, data);
      item.Year = sanitizeInt(data);
    } catch (error) {}

    //get MakeModel1 from xpath
    try {
      let [data] = await page.$x(xpaths.MakeModel1);
      data = await page.evaluate((el) => el.innerText, data);
      item.MakeModel1 = sanitizeString(data);
    } catch (error) {}

    //get MakeModel2 from xpath
    try {
      let [data] = await page.$x(xpaths.MakeModel2);
      data = await page.evaluate((el) => el.innerText, data);
      item.MakeModel2 = sanitizeString(data);
    } catch (error) {}

    //get Kilometers from xpath
    try {
      let [data] = await page.$x(xpaths.Kilometers);
      data = await page.evaluate((el) => el.innerText, data);
      item.Kilometers = sanitizeInt(data);
    } catch (error) {}

    //get Transmission from xpath
    try {
      let [data] = await page.$x(xpaths.Transmission);
      data = await page.evaluate((el) => el.innerText, data);
      item.Transmission = sanitizeString(data);
    } catch (error) {}

    //get Engine from xpath
    try {
      let [data] = await page.$x(xpaths.Engine);
      data = await page.evaluate((el) => el.innerText, data);
      item.Engine = sanitizeString(data);
    } catch (error) {}

    //get Engine Size from xpath
    try {
      let [data] = await page.$x(xpaths.EngineSize);
      data = await page.evaluate((el) => el.innerText, data);
      item.EngineSize = sanitizeString(data);
    } catch (error) {}

    //get Trim from xpath
    try {
      let [data] = await page.$x(xpaths.Trim);
      new_data = await page.evaluate((el) => el.innerHTML, data);
      new_data_splited = new_data.split('<!-- -->');
      //Trim value is present at second last index
      //so reverse the array and get the second index
      const trim_value = new_data_splited.reverse()[1];
      item.Trim = sanitizeString(trim_value);
    } catch (error) {}

    //get City Fuel Economy from xpath
    try {
      let [data] = await page.$x(xpaths.CityFuelEconomy);
      data = await page.evaluate((el) => el.innerText, data);
      item.CityFuelEconomy = sanitizeString(data);
    } catch (error) {}

    //get Highway Fuel Economy from xpath
    try {
      let [data] = await page.$x(xpaths.HwyFuelEconomy);
      data = await page.evaluate((el) => el.innerText, data);
      item.HwyFuelEconomy = sanitizeString(data);
    } catch (error) {}

    //get Drive Type from xpath
    try {
      let [data] = await page.$x(xpaths.DriveType);
      data = await page.evaluate((el) => el.innerText, data);
      item.DriveType = sanitizeString(data);
    } catch (error) {}

    //get Exterior Color from xpath
    try {
      let [data] = await page.$x(xpaths.ExteriorColor);
      data = await page.evaluate((el) => el.innerText, data);
      item.ExteriorColor = sanitizeString(data);
    } catch (error) {}

    //get Interior Color from xpath
    try {
      let [data] = await page.$x(xpaths.InteriorColor);
      data = await page.evaluate((el) => el.innerText, data);
      item.InteriorColor = sanitizeString(data);
    } catch (error) {}

    //get Doors from xpath
    try {
      let [data] = await page.$x(xpaths.Doors);
      data = await page.evaluate((el) => el.innerText, data);
      item.Doors = sanitizeInt(data);
    } catch (error) {}

    //get Stock from xpath
    try {
      let [data] = await page.$x(xpaths.StockNumber);
      data = await page.evaluate((el) => el.innerText, data);
      item.StockNumber = sanitizeInt(data);
    } catch (error) {}

    //get FuelType from xpath
    try {
      let [data] = await page.$x(xpaths.FuelType);
      data = await page.evaluate((el) => el.innerText, data);
      item.FuelType = sanitizeString(data);
    } catch (error) {}

    //get Vin from xpath
    try {
      let [data] = await page.$x(xpaths.Vin);
      data = await page.evaluate((el) => el.innerText, data);
      item.Vin = sanitizeString(data);
    } catch (error) {}

    //fetch all images src
    try {
      let imgs = await page.$x(xpaths.pictures);
      let imgSrcs = await Promise.all(
        imgs.map(async (img) => {
          return await page.evaluate((el) => el.src, img);
        })
      );
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
      await write(Object.keys(items), items, `apnamotors_cars.csv`);
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
    let items = document.querySelectorAll(`.py-1 > a`);
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
