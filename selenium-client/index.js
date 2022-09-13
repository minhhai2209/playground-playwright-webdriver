const { Builder, Capabilities, By, Key } = require("selenium-webdriver");
var capabilities = Capabilities.chrome();
(async function helloSelenium() {
  let driver = new Builder()
    // .usingServer("http://localhost:4443/wd/hub")
    .usingServer("http://localhost:3000/wd/hub")
    .withCapabilities(capabilities)
    .build();
  try {
    await driver.get("http://www.google.com/ncr");
    await driver.findElement(By.name("q")).sendKeys("webdriver");
  } catch (e) {
    console.error(e);
  } finally {
    await driver.quit();
  }
})();
