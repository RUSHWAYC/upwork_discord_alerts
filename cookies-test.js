const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  //load cookies
  const cookiesString = await fs.readFile("./cookies.json");
  const cookies = JSON.parse(cookiesString);
  await page.setCookie(...cookies);

  await page.goto(
    "https://www.upwork.com/nx/jobs/search/?q=customer%20support&t=0&contractor_tier=2,3&hourly_rate=15-&from_recent_search=true&sort=recency"
  );
  sleep(6000);
  //await browser.close();
})();
