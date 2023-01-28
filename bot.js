const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const puppeteer = require("puppeteer");

client.on("ready", () => {
  console.log("I am ready!");
  (async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
    );
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

    await browser.close();
    console.log(jobPosts);
  })();
});

client.login("Insert token.");
