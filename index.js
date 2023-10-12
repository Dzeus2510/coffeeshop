const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
var mysql = require('mysql');
const fs = require('fs')

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "doanngocvu25102003",
  database: "coffeeshop"
});

var places = fs.readFileSync('places.txt', 'utf-8').toString().split('\n')
con.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to the database');
});

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  for (let i = 0; i < places.length; i++) {
    var modifyplace = (places[i]).replace(/ /g, "+")
    try {
      await page.goto(
        `https://www.google.com/maps/search/coffee+shop+` + modifyplace
      );
    } catch (error) {
      console.log("error going to page");
    }

    await autoScroll(page);
    await clickAndGoBack(page);
  }
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));
    await browser.close();
  

  con.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
      throw err;
    }
    console.log('Database connection closed');
  });
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    const wrapper = document.querySelector('div[role="feed"]');
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 1000;
      var scrollDelay = 4000;
      var timer = setInterval(async () => {
        var scrollHeightBefore = wrapper.scrollHeight;
        wrapper.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeightBefore) {
          totalHeight = 0;
          await new Promise((resolve) => setTimeout(resolve, scrollDelay));
          // Calculate scrollHeight after waiting
          var scrollHeightAfter = wrapper.scrollHeight;
          if (scrollHeightAfter > scrollHeightBefore) {
            search.click()
            // More content loaded, keep scrolling
            return;
          } else {
            // No more content loaded, stop scrolling
            clearInterval(timer);
            resolve();
          }
        }
      }, 200);
    });
  });
}

var d = new Date
const dformat = [d.getFullYear(),
               d.getMonth()+1,
               d.getDate()].join('-')+' '+
              [d.getHours(),
               d.getMinutes(),
               d.getSeconds()].join(':');

async function clickAndGoBack(page) {
  // Click on every search result div with the same class name

  const urls = await page.evaluate(() => {
    const elements = document.querySelectorAll('.hfpxzc'); // Replace with your class name
    const hrefs = [];

    elements.forEach((element) => {
      const href = element.getAttribute('href');
      if (href) {
        hrefs.push(href);
      }
    });
    return hrefs;
  });

  console.log(urls.length);

  for (let i = 0; i < urls.length; i++) {
    await page.goto(urls[i]);
    await getData(page);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
  };
}


async function getData(page) {
  const html = await page.content();
  const $ = cheerio.load(html);
  const divTags = $("div");
  const parents = [];
  divTags.each((i, el) => {
    const datavalue = $(el).attr("role");
    if (!datavalue) {
      return;
    }
    if (datavalue.includes("main")) {
      parents.push($(el).parent());
    }
  });

  console.log("parents", parents.length);

  const coffeeshop = [];

  parents.forEach((parent) => {
    const website = parent.find('a[data-tooltip="Open website"]').attr("href") ? parent.find('a[data-tooltip="Open website"]').attr("href") : "No Website";
    // find a div that includes the class fontHeadlineSmall
    const storeName = parent.find("h1").text();
    // find span that includes class fontBodyMedium
    const phonenum = parent.find('button[data-tooltip="Copy phone number"]').text() ? parent.find('button[data-tooltip="Copy phone number"]').text() : "No Phone";
    const address = parent.find('button[data-tooltip="Copy address"]').text();
    const cat = parent.find('button[class="DkEaL "]').text();
    const stars = parent.find('span.ceNzKf').attr("aria-label") ? parseFloat(parent.find('span.ceNzKf').attr("aria-label")) : "No Stars";
    const reviews = parent.find('button[class="HHrUdb fontTitleSmall rqjGif"] > span').text() ? parseInt(parent.find('button[class="HHrUdb fontTitleSmall rqjGif"] > span').text()) : "No Review"
    const img = parent.find('button[class="aoRNLd kn2E5e NMjTrf lvtCsd "] > img').attr("src") ? parent.find('button[class="aoRNLd kn2E5e NMjTrf lvtCsd "] > img').attr("src") : "No Img xD"

    coffeeshop.push({
      address: address,
      category: cat,
      phone: phonenum,
      // googleUrl: url,
      bizWebsite: website,
      storeName,
      // ratingText,
      stars: stars,
      numberOfReviews: reviews,
      image: img,
    });

    con.query("SELECT COUNT(*) FROM coffeeshop.coffeeplaces WHERE address = ?", [address], function (error, result) {
      //Display the records one by one
      const count = result[0]['COUNT(*)'];
      if (count == 0) {
        var sql = "INSERT INTO coffeeplaces (name, address, cat, phone, website, stars, review, createdAt, updatedAt, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews, dformat, dformat, img], function (err, result) {
          if (err) throw err;
          console.log("NEW record inserted");
        });
      } else {
        var sql = "UPDATE coffeeplaces SET name = ?, address = ?, cat = ?, phone = ?, website = ?, stars = ?, review = ?, updatedAt = ?, image = ? WHERE address = ?";
        con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews, dformat, img, address], function (err, result) {
          if (err) throw err;
          console.log("OLD record updated");
        });
      }
    });

    // console.log(coffeeshop)
    return coffeeshop;
  })
};



