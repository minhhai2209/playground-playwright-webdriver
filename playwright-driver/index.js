const express = require("express");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const { chromium } = require("playwright");

const app = express();
const port = 3000;

app.use(express.json());

const sessions = {};

app.post(
  "/wd/hub/session",
  asyncHandler(async (req, res) => {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    page._katElements = {};
    const sessionId = uuidv4();
    sessions[sessionId] = { browser, page };
    const capabilities = {};
    res.json({
      value: {
        sessionId,
        capabilities,
      },
    });
  })
);

app.delete(
  "/wd/hub/session/:sessionId",
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { browser } = sessions[sessionId];
    await browser.close();
    res.json({ value: null });
  })
);

app.post(
  "/wd/hub/session/:sessionId/url",
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { url } = req.body;
    const { page } = sessions[sessionId];
    await page.goto(url);
    res.json({ value: null });
  })
);

app.post(
  "/wd/hub/session/:sessionId/element",
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { using, value } = req.body;
    const { page } = sessions[sessionId];
    const elementHandle = await page.$(value);
    const { _guid: elementId } = elementHandle;
    page._katElements[elementId] = elementHandle;
    res.json({
      value: {
        "element-6066-11e4-a52e-4f735466cecf": elementId,
      },
    });
  })
);

app.post(
  "/wd/hub/session/:sessionId/element/:elementId/value",
  asyncHandler(async (req, res) => {
    const { sessionId, elementId } = req.params;
    const { text, value } = req.body;
    const { page } = sessions[sessionId];
    const elementHandle = page._katElements[elementId];
    await elementHandle.focus();
    for (let key of value) {
      await page.keyboard.down(key);
      await page.keyboard.up(key);
    }
    res.json({
      value: null,
    });
  })
);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
