const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
var mysql = require('mysql2');
const fs = require('fs')

var con = mysql.createConnection({
  host: "coffeemysql",
  user: "root",
  password: "doanngocvu25102003",
  database: "coffeeshop",
  dialect: "mysql"
});
//set up connection to mysql database

var places = fs.readFileSync('places.txt', 'utf-8').toString().split('\n')
con.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to the database');
});
//set up places, taken from places.txt, and connect to the database

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: '/usr/bin/google-chrome',  args: ['--no-sandbox'] });
  //launch puppeteer with its setting: headless true: surf the web in the background, executablePath: the path to googlechrome in linux (docker), args no sandbox: sandbox ask the 
  //will need to set up configuration etc, no sandbox will allow user to freely access the web they need to
  const page = await browser.newPage();
  //open new browser page
  for (let i = 0; i < places.length; i++) {
    var modifyplace = (places[i]).replace(/ /g, "+")
    //for each place in places.txt, replay the " " with "+", so it can be added into the search url below
    try {
      await page.goto(
        `https://www.google.com/maps/search/coffee+shop+` + modifyplace
      );
    } catch (error) {
      console.log("error going to page");
    }
    //search all coffee shop of "*places*"

    await autoScroll(page);
    await clickAndGoBack(page);
    //scroll and open each search result
  }
    const pages = await browser.pages();
    //after getting all data, close all pages, and close browser
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
//end the connection with database

async function autoScroll(page) {
  await page.evaluate(async () => {
    const wrapper = document.querySelector('div[role="feed"]');
    //find div with roll="feed" to start scrolling
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 1000;
      var scrollDelay = 4000;
      var timer = setInterval(async () => {
        var scrollHeightBefore = wrapper.scrollHeight;
        //record scroll height before scrolling
        wrapper.scrollBy(0, distance);
        //scroll vertically by 1000 px
        totalHeight += distance;
        //plus in the totalHeight each time it scrolls
        if (totalHeight >= scrollHeightBefore) {
          totalHeight = 0;
          //if the total height is bigger than scroll height, meaning no more content is loadingq, it reset scroll height to 0
          //and start scrolling again, after 4 second (scroll delay), it check again
          await new Promise((resolve) => setTimeout(resolve, scrollDelay));
          // Calculate scrollHeight after waiting
          var scrollHeightAfter = wrapper.scrollHeight;
          if (scrollHeightAfter > scrollHeightBefore) {
            //if there are still more scrolling, the code will attempt to press the "search" button to load more content
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
//get current date, modify it to look like datetime in mysql database

async function clickAndGoBack(page) {
  // Click on every search result div with the same class name

  const urls = await page.evaluate(() => {
    const elements = document.querySelectorAll('.hfpxzc');
    //a list of elements contain every search result got from searching and scrolling
    const hrefs = [];
    //make an array of hrefs

    elements.forEach((element) => {
      const href = element.getAttribute('href');
      if (href) {
        hrefs.push(href);
      }
    });
    return hrefs;
  });
  //for each elements, add its href to the specific page in google map into the href list

  console.log(urls.length);

  for (let i = 0; i < urls.length; i++) {
    await page.goto(urls[i]);
    await getData(page);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    //go into each page and get their data
  };
}


async function getData(page) {
  const html = await page.content();
  //fetch all html content
  const $ = cheerio.load(html);
  //load the html content into cheerio, a library use to manipulate html
  const divTags = $("div");
  //using cheerio to get all "div" elements
  const parents = [];
  //make a parents array to store the parent element of div
  divTags.each((i, el) => {
    const datavalue = $(el).attr("role");
    //check in each divTags to see if there any attribute "role"
    if (!datavalue) {
      return;
      //if there are none, return to continue the loop
    }
    if (datavalue.includes("main")) {
      parents.push($(el).parent());
      //if there are role, check if there any "main" inside the whole div, if there is, push it in the parents array
    }
  });

  console.log("parents", parents.length);

  const coffeeshop = [];

  parents.forEach((parent) => {
    const website = parent.find('a[data-tooltip="Open website"]').attr("href") ? parent.find('a[data-tooltip="Open website"]').attr("href") : "No Website";
    // find a div that includes the data-tooltip = Open Website to get its webpage
    const storeName = parent.find("h1").text();
    // find span that includes h1 to get its name
    const phonenum = parent.find('button[data-tooltip="Copy phone number"]').text() ? parent.find('button[data-tooltip="Copy phone number"]').text() : "No Phone";
    //check if there are phone number to get its phonenum
    const address = parent.find('button[data-tooltip="Copy address"]').text();
    //copy its address
    const cat = parent.find('button[class="DkEaL "]').text();
    //get category
    const stars = parent.find('span.ceNzKf').attr("aria-label") ? parseFloat(parent.find('span.ceNzKf').attr("aria-label")) : "No Stars";
    //check if there are stars to get stars
    const reviews = parent.find('button[class="HHrUdb fontTitleSmall rqjGif"] > span').text() ? parseInt(parent.find('button[class="HHrUdb fontTitleSmall rqjGif"] > span').text()) : "No Review"
    //check if there are reviews to get number of reviews
    const img = parent.find('button[class="aoRNLd kn2E5e NMjTrf lvtCsd "] > img').attr("src") ? parent.find('button[class="aoRNLd kn2E5e NMjTrf lvtCsd "] > img').attr("src") : "No Img xD"
    //check if there are image to get image

    coffeeshop.push({
      address: address,
      category: cat,
      phone: phonenum,
      bizWebsite: website,
      storeName,
      stars: stars,
      numberOfReviews: reviews,
      image: img,
    });

    con.query("SELECT COUNT(*) FROM coffeeshop.coffeeplaces WHERE address = ?", [address], function (error, result) {
      const count = result[0]['COUNT(*)'];
      //count to check if there already a coffeeplace with the same address before
      if (count == 0) {
        var sql = "INSERT INTO coffeeplaces (name, address, cat, phone, website, stars, review, createdAt, updatedAt, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews, dformat, dformat, img], function (err, result) {
          if (err) throw err;
          console.log("NEW record inserted");
          //if there are none in database, add new coffeeplace
        });
      } else {
        var sql = "UPDATE coffeeplaces SET name = ?, address = ?, cat = ?, phone = ?, website = ?, stars = ?, review = ?, updatedAt = ?, image = ? WHERE address = ?";
        con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews, dformat, img, address], function (err, result) {
          if (err) throw err;
          console.log("OLD record updated");
          //if there already have one, update the coffeeplace
        });
      }
    });

    return coffeeshop;
  })
};



