import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu-sandbox"],
    headless: true,
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:5173", { waitUntil: "load" });

  // Developer mode
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
  await new Promise(r => setTimeout(r, 1000));

  // Click Balon button
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await (await b.getProperty("textContent")).jsonValue();
    if (text.includes("Balon")) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 800));

  // Click Başlat
  const startBtns = await page.$$(".start-button");
  if (startBtns.length > 0) {
    await startBtns[0].click();
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/tmp/balloon_t1.png" });

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: "/tmp/balloon_t2.png" });

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: "/tmp/balloon_t3.png" });

  await browser.close();
  console.log("Screenshots captured!");
}

run().catch(console.error);
