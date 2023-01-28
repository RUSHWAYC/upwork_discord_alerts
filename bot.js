const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const puppeteer = require("puppeteer");

client.on("ready", () => {
  console.log("I am ready!");

  let previous_content = [];
  let new_content = [];

  async function scrape() {
    //Puppeteer code.
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
    //Puppeteer code end.

    jobPosts.forEach(function (jobPosts) {
      let content = jobPosts;
      new_content.push(content);
    });

    function compareArrays(a, b) {
      // If length is not equal
      if (a.length != b.length) return "False";
      else {
        // Comparing each element of array
        for (var i = 0; i < a.length; i++) if (a[i] != b[i]) return "False";
        return "True";
      }
    }
    let compareResults = compareArrays(previous_content, new_content);

    if (previous_content.length == 0) {
      previous_content = new_content;
      console.log("Previous content is empty.");
    } else {
      if (!compareResults) {
        console.log("New job found!");
        client.users.fetch("181195607887708161", false).then((user) => {
          user.send(
            `------------------------\n*New job post found!*\n\n**Title**: ${jobPosts[0].title}\n**Hourly**: ${jobPosts[0].hourly}\n\n**Description**: ${jobPosts[0].description}\n\n**Link**: ${jobPosts[0].link}`
          );
        });
      } else {
        console.log(
          "No new job posts, waiting 60 seconds before checking again."
        );
      }
    }
    previous_content = new_content;
    new_content = [];
  }
  setInterval(scrape, 6000);
});

//Discord bot token.
client.login("Insert token here.");
