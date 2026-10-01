import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu-sandbox"],
    headless: true,
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  
  page.on("console", msg => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", err => console.log("PAGE ERROR:", err.toString()));

  await page.goto("http://localhost:5173", { waitUntil: "load" });

  // Enable developer mode in localStorage and reload
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("dijital-kahramanlar-session");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.settings.developerMode = true;
        localStorage.setItem("dijital-kahramanlar-session", JSON.stringify(parsed));
      }
    } catch (e) {}
  });

  await page.reload({ waitUntil: "load" });
  await new Promise(r => setTimeout(r, 1200));

  // Click Bardak in developer nav
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await (await b.getProperty("textContent")).jsonValue();
    if (text.includes("Bardak")) {
      console.log("Found Bardak button, clicking...");
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot before start (idle table + cups)
  await page.screenshot({ path: "/tmp/cup_game_before_start.png" });
  console.log("Saved /tmp/cup_game_before_start.png");

  // Click Başlat if available
  const startBtns = await page.$$(".start-button");
  if (startBtns.length > 0) {
    console.log("Found Başlat button, clicking...");
    await startBtns[0].click();
  }

  // Wait 400ms for peek phase (target cup is lifted, showing icon!)
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "/tmp/cup_game_peek.png" });
  console.log("Saved /tmp/cup_game_peek.png");

  // Wait 1500ms for shuffle/guess phase
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: "/tmp/cup_game_guess.png" });
  console.log("Saved /tmp/cup_game_guess.png");

  await browser.close();
  console.log("Done!");
}

run().catch(console.error);
