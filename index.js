require("dotenv").config();
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://www.upwork.com/nx/jobs/search/?q=customer%20support&t=0&contractor_tier=3&hourly_rate=15-&from_recent_search=true&sort=recency"
  );
  await page.waitForTimeout(5000);

  const jobPosts = await page.evaluate(() =>
    Array.from(
      document.getElementsByClassName("up-card-list-section"),
      (e) => ({
        title: e.querySelector(".my-10 a").innerText,
        hourly: e.querySelector(".mb-10 strong").innerText,
        description: e.querySelector(".mt-10 span").innerText,
        link: e.querySelector(".my-10 a").href,
      })
    )
  );

  // let titles = await page.evaluate(() => {
  //   let data = [];
  //   let elements = document.getElementsByClassName("job-tile-title");
  //   for (let element of elements) {
  //     data.push(element.textContent);
  //   }
  //   return data;
  // });
  await browser.close();
  //const regEx = /(?<=Floor Price)[0-9.]+/g;
  console.log(jobPosts);
})();
