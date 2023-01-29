const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.upwork.com/ab/account-security/login", {
    waitUntil: "networkidle2",
  });
  await page.type("#login_username", "USERNAME");
  await page.click("#login_password_continue");

  await page.waitForSelector("#login_password", {
    visible: true,
    hidden: false,
  });
  await page.type("#login_password", "PASSWORD");
  console.log("Password entered.");
  await sleep(1000);
  console.log("Closing popup.");
  await page.click("#onetrust-close-btn-container > button");
  console.log("Popup closed.");
  await sleep(2000);
  await page.click("#login_control_continue");
  console.log("Log in clicked.");

  await sleep(10000);
  //Enter your 2-step auth code manually.
  await page.click("#next_continue");
  await sleep(10000);

  //save cookies
  const cookies = await page.cookies();
  await fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2));

  //await browser.close();
})();
