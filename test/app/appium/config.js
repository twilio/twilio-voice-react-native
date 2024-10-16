const capabilities = {
  'platformName': 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'com.example.twiliovoicereactnative',
  'appium:appActivity': '.MainActivity',
  'appium:autoGrantPermissions': 'true',
};

const webdriverioOptions = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities,
};

module.exports = {
  capabilities,
  webdriverioOptions,
};
