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

  await new Promise(r => setTimeout(r, 1000));

  // Click Başlat
  const startBtns = await page.$$(".start-button");
  if (startBtns.length > 0) {
    console.log("Found Başlat button, clicking...");
    await startBtns[0].click();
  }

  // 1. Peek phase (target cup is lifted, showing token & badge!)
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: "/tmp/actual_app_peek.png" });
  console.log("Saved /tmp/actual_app_peek.png");

  // 2. Mid-shuffle (cups are actively arcing and swapping! 1840ms after t=1000 is t=2840, exactly 240ms into 1st swap)
  await new Promise(r => setTimeout(r, 1840));
  await page.screenshot({ path: "/tmp/actual_app_shuffle.png" });
  console.log("Saved /tmp/actual_app_shuffle.png");

  // 3. Wait for guess phase (shuffle finishes around t=5000)
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: "/tmp/actual_app_guess.png" });
  console.log("Saved /tmp/actual_app_guess.png");

  // 4. Click middle cup
  const canvas = await page.$("canvas");
  const box = await canvas.boundingBox();
  console.log("Clicking cup at center...");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.45);

  // 5. Result phase
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: "/tmp/actual_app_result.png" });
  console.log("Saved /tmp/actual_app_result.png");

  await browser.close();
  console.log("All done!");
}

run().catch(console.error);
