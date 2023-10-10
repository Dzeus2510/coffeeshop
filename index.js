const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
var mysql = require('mysql');
var mysql2 = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "doanngocvu25102003",
  database: "coffeeshop"
});

con.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to the database');
});

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  try {
    await page.goto(
      `https://www.google.com/maps/search/coffee+shop/@21.0286704,105.7702714,14z/data=!3m1!4b1?entry=ttu`
    );
  } catch (error) {
    console.log("error going to page");
  }

  // const grabPlace = await page.$x("/html/body/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div[1]/div[5]/div/a");
  //     const places =  page.$x("/html/body/div[3]/div[8]/div[9]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]/div[1]/div[5]/div/a");
  //     let coffeeshop= []
  //     places.forEach((tag) => {
  //         coffeeshop.push(tag.innerText)
  //     });
  //     return coffeeshop;
  // });

  async function autoScroll(page) {
    await page.evaluate(async () => {
      const wrapper = document.querySelector('div[role="feed"]');
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 1000;
        var scrollDelay = 3000;
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
      await getData();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };
  }



  await autoScroll(page);
  await clickAndGoBack(page);


  // await autoScroll(page);
  const pages = await browser.pages();
  await Promise.all(pages.map((page) => page.close()));
  await browser.close();


  async function getData() {
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
      const ratingText = parent
        .find("span.fontBodyMedium > span")
        .attr("aria-label") ?
        parent
          .find("span.fontBodyMedium > span")
          .attr("aria-label") : "No Review";
      const phonenum = parent.find('button[data-tooltip="Copy phone number"]').text() ? parent.find('button[data-tooltip="Copy phone number"]').text() : "No Phone";
      const address = parent.find('button[data-tooltip="Copy address"]').text();
      const cat = parent.find('button[class="DkEaL "]').text();
      const stars = parent.find("span.fontBodyMedium > span").attr("aria-label") ? Number(ratingText?.split("stars")?.[0]?.trim()): "No Stars";
      const reviews = parent.find("span.fontBodyMedium > span").attr("aria-label") ? Number(ratingText?.split("stars")?.[1]?.replace("Reviews", "")?.trim()): "No Review"

      coffeeshop.push({
        address: address,
        category: cat,
        phone: phonenum,
        // googleUrl: url,
        bizWebsite: website,
        storeName,
        ratingText,
        stars: stars,
        numberOfReviews: reviews,
      });

      con.query("SELECT COUNT(*) FROM coffeeshop.coffeeplaces WHERE address = ?", [address], function (error, result) {
        //Display the records one by one
            const count = result[0]['COUNT(*)'];
            if (count == 0 ){
              var sql = "INSERT INTO coffeeplaces (name, address, cat, phone, website, stars, review) VALUES (?, ?, ?, ?, ?, ?, ?)";
              con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews], function (err, result) {
                if (err) throw err;
                console.log("NEW record inserted");
              });
            } else {
              var sql = "UPDATE coffeeplaces SET name = ?, address = ?, cat = ?, phone = ?, website = ?, stars = ?, review = ? WHERE address = ?";
              con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews , address], function (err, result) {
                if (err) throw err;
                console.log("OLD record updated");
              });
            }
          });
      

    //   var sql = "INSERT INTO coffeeplaces (name, address, cat, phone, website, stars, review) VALUES (?, ?, ?, ?, ?, ?, ?)";
    //     con.query(sql, [storeName, address, cat, phonenum, website, stars, reviews], function (err, result) {
    //       if (err) throw err;
    //       console.log("record inserted");
    //     });
    // });

    console.log(coffeeshop)
    return coffeeshop;
  })
};
  con.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
      throw err;
    }
    console.log('Database connection closed');
  });
})();


