const { remote } = require('webdriverio');
const { webdriverioOptions } = require('./config');

async function runTest() {
  const driver = await remote(webdriverioOptions);

  try {
    await driver.pause(5000);
    const runTestButton = driver.$('~runTest');
    await runTestButton.click();
    await driver.pause(10000);
  } finally {
    await driver.pause(1000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);
