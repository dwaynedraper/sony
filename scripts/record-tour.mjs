/**
 * Records a tutorial video by driving the REAL app with a fake mouse cursor.
 *
 * Because it clicks the actual UI, the tutorial can't drift out of date — if
 * the app changes, re-run this and you get a correct video. No stale demos.
 *
 * SETUP (once):
 *   npm i -D playwright
 *   npx playwright install chromium
 *
 * RUN:
 *   npm run dev                      # in one terminal
 *   node scripts/record-tour.mjs     # in another
 *
 * Output: docs/tour/<random>.webm — convert to mp4 if you want to text it around:
 *   ffmpeg -i docs/tour/*.webm -vcodec libx264 -crf 23 docs/tour/toolkit-tour.mp4
 *
 * Env:
 *   BASE_URL=http://localhost:3000   (default)
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "docs/tour";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 }, // iPhone-ish — this is a phone tool
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
});
const page = await context.newPage();

// ── Fake cursor + caption bar, injected into the real page ──────────────────
async function installOverlay() {
  await page.addStyleTag({
    content: `
      #tour-cursor {
        position: fixed; z-index: 2147483647; width: 22px; height: 22px;
        margin: -11px 0 0 -11px; border-radius: 50%;
        background: rgba(255,122,26,.35); border: 2px solid #ff7a1a;
        box-shadow: 0 0 0 4px rgba(255,122,26,.15);
        pointer-events: none; transition: left .6s cubic-bezier(.4,0,.2,1), top .6s cubic-bezier(.4,0,.2,1);
        left: 195px; top: 700px;
      }
      #tour-cursor.tap { animation: tourTap .35s ease-out; }
      @keyframes tourTap { 0%{transform:scale(1)} 50%{transform:scale(.55)} 100%{transform:scale(1)} }
      #tour-caption {
        position: fixed; z-index: 2147483646; left: 0; right: 0; bottom: 0;
        background: rgba(11,13,16,.94); color: #eef2f6; font: 700 15px/1.4 -apple-system,system-ui,sans-serif;
        padding: 16px 18px calc(16px + env(safe-area-inset-bottom)); text-align: center;
        border-top: 2px solid #ff7a1a; pointer-events: none;
        opacity: 0; transition: opacity .3s;
      }
      #tour-caption.on { opacity: 1; }
    `,
  });
  await page.evaluate(() => {
    const c = document.createElement("div");
    c.id = "tour-cursor";
    document.body.appendChild(c);
    const cap = document.createElement("div");
    cap.id = "tour-caption";
    document.body.appendChild(cap);
  });
}

async function say(text, hold = 2200) {
  await page.evaluate((t) => {
    const cap = document.getElementById("tour-caption");
    if (!cap) return;
    cap.textContent = t;
    cap.classList.add("on");
  }, text);
  await sleep(hold);
}

async function clearCaption() {
  await page.evaluate(() => document.getElementById("tour-caption")?.classList.remove("on"));
  await sleep(300);
}

/** Glide the cursor to an element, "tap" it, then really click it. */
async function tap(locator, { pause = 700 } = {}) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element not visible — did the UI change?");
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);

  await page.evaluate(([x, y]) => {
    const c = document.getElementById("tour-cursor");
    if (c) { c.style.left = x + "px"; c.style.top = y + "px"; }
  }, [x, y]);
  await sleep(700); // let the glide finish

  await page.evaluate(() => {
    const c = document.getElementById("tour-cursor");
    if (c) { c.classList.add("tap"); setTimeout(() => c.classList.remove("tap"), 350); }
  });
  await sleep(200);
  await locator.click();
  await sleep(pause);
}

// ── The tour ────────────────────────────────────────────────────────────────
await page.goto(`${BASE}/oos`, { waitUntil: "networkidle" });
await installOverlay();
await sleep(800);

await say("No login. No email. No location.", 2600);
await say("Set your schedule once.", 2200);
await clearCaption();

await tap(page.getByRole("button", { name: /set my schedule/i }));

await say("Which store you work, each day.", 2200);

// Sun 0058 · Mon 0180 · Tue 0180 · Wed/Thu off · Fri 0180 · Sat 0180
const pads = page.locator('input[inputmode="numeric"]');
const week = ["58", "180", "180", "", "", "180", "180"];
for (let i = 0; i < 7; i++) {
  if (!week[i]) continue;
  await pads.nth(i).click();
  await pads.nth(i).type(week[i], { delay: 220 }); // typed digits fill from the right
  await sleep(350);
}
await sleep(900);

await clearCaption();
await tap(page.getByRole("button", { name: /save schedule/i }), { pause: 1400 });

await say("Now it just opens to your store.", 2400);
await say("This is your table, top-down.", 2400);
await clearCaption();

// Walk a side
await tap(page.getByText("Right", { exact: true }), { pause: 900 });
await say("Tap whatever's out of stock.", 2200);
await clearCaption();

const squares = page.locator("div").filter({ hasText: /^A7 IV$/ }).first();
await tap(squares.first(), { pause: 600 }).catch(() => {});
await sleep(600);

await say("Then mark the side done.", 2000);
await clearCaption();
await tap(page.getByRole("button", { name: /^done$/i }), { pause: 1400 });

await say("Green check. That side's counted.", 2400);
await clearCaption();

// Edit mode — the headline feature
await tap(page.getByText("Left", { exact: true }), { pause: 900 });
await say("Table doesn't match the plano?", 2200);
await clearCaption();
await tap(page.getByRole("button", { name: /edit/i }), { pause: 1000 });
await say("Tap any square to change it.", 2200);
await clearCaption();

await sleep(1200);
await say("Saved for YOUR store only.", 2600);
await clearCaption();

await tap(page.getByRole("button", { name: /^‹$/ }), { pause: 1000 }).catch(() => {});

await say("Then paste the report anywhere.", 2600);

await sleep(1200);
await context.close(); // flushes the video file
await browser.close();
console.log(`\nDone. Video written to ${OUT}/`);
console.log(`Convert to mp4:\n  ffmpeg -i ${OUT}/*.webm -vcodec libx264 -crf 23 ${OUT}/toolkit-tour.mp4\n`);
