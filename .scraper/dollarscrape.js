// scrapeSandDollar.js
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = "https://thesanddollarlv.com/lounge/";
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  const today = new Date();
  const daysToCheck = 30;

  let events = [];

  for (let i = 0; i < daysToCheck; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = d.toLocaleString("en-US", { month: "long" }).toUpperCase();
    const day = d.getDate();

    console.log(`Checking ${month} ${day}, ${year}`);

    // Click the date in the calendar (day buttons usually have [data-day] attributes in MEC)
    try {
      await page.click(`.mec-calendar-day[data-day='${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}']`, { timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      continue; // no clickable date (empty day)
    }

    // Grab event info for that day
    const dayEvents = await page.$$eval(".mec-event-article", (nodes) =>
      nodes.map((node) => ({
        title: node.querySelector(".mec-event-title a")?.textContent?.trim(),
        time: node.querySelector(".mec-time")?.textContent?.trim(),
        link: node.querySelector(".mec-event-title a")?.href,
      }))
    );

    dayEvents.forEach((ev) => {
      events.push({
        date: d.toISOString().slice(0, 10),
        ...ev,
      });
    });
  }

  console.log("Upcoming Events:");
  console.log(events);

  await browser.close();
})();
