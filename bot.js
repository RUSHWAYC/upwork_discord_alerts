const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const fs = require("fs").promises;
const puppeteer = require("puppeteer");

//Initiate Discord bot.
client.on("ready", async () => {
  console.log("I am ready!");

  let previousJobPost = null;

  //Function to check for new job posts.
  async function scrapeJobAds() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
    );

    //Load cookies.
    const cookiesString = await fs.readFile("./cookies.json");
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

    await page.goto(
      "https://www.upwork.com/nx/jobs/search/?q=customer%20support&t=0&contractor_tier=2,3&hourly_rate=15-&from_recent_search=true&sort=recency"
    );

    await page.waitForSelector(".up-card-list-section");

    const jobPosts = await page.evaluate(() =>
      Array.from(
        document.getElementsByClassName("up-card-list-section"),
        (e) => ({
          title: e.querySelector(".my-10 a").innerText,
          hourly: e.querySelector(".mb-10 strong").innerText,
          description: e.querySelector(".mt-10 span").innerText,
          link: e.querySelector(".my-10 a").href,
          posted: e.querySelector(
            ".mb-10 > div:nth-child(1) > small > span:nth-child(4) > span > span"
          ).innerText,
        })
      )
    );

    await browser.close();

    //Logic to see how old are the first three posts.
    //UpWork has a thing where first one or two posts are sponsored.
    //And as such are not the latest post.
    function convertToMinutes(post) {
      const timeUnits = {
        minutes: 1,
        hour: 60,
        hours: 60,
        day: 1440,
        days: 1440,
      };

      const postUnit = Object.keys(timeUnits).find((unit) =>
        post.includes(unit + " ago")
      );
      return parseInt(post.split(" ")[0], 10) * timeUnits[postUnit];
    }

    const newJobPost = jobPosts.reduce((acc, curr) => {
      if (!acc) {
        return curr;
      }

      const accMinutes = convertToMinutes(acc.posted);
      const currMinutes = convertToMinutes(curr.posted);
      return accMinutes < currMinutes ? acc : curr;
    });

    if (previousJobPost === null) {
      console.log("previousJobPost is null, adding newJobPost");
      previousJobPost = newJobPost.title;
    } else if (previousJobPost !== newJobPost.title) {
      client.users.fetch("181195607887708161", false).then((user) => {
               user.send(
                 `------------------------\n*New job post found!*\n\n**Title**: ${jobPosts[0].title}\n**Hourly**: ${jobPosts[0].hourly}\n\n**Description**: ${jobPosts[0].description}\n\n**Link**: ${jobPosts[0].link}`
               );
             });
      previousJobPost = newJobPost.title;
    } else {
      console.log("No new jobs found.");
    }
  }

  //Run the scraper every 5 minutes.
  setInterval(scrapeJobAds, 300000);
});

//Discord bot token.
client.login("TOKEN");