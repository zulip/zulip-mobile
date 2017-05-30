import wd from 'wd';

const port = 4723;
const driver = wd.promiseChainRemote('localhost', port);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const caps = {
  'platformName': 'iOS',
  'app': `${process.cwd()}/ios/build/Build/Products/Release-iphonesimulator/ZulipMobile.app`,
  platformVersion: '10.3',
  deviceName: 'iPhone Simulator',
};

const options = {
  validEmail: 'iago@zulip.com',
  inValidEmail: 'invalid@zulip.com',
  validServer: 'http://localhost:9991/',
  inValidServer: 'http://invalid:9991'
};

describe('Basic', () => {
  beforeAll(async () => await driver.init(caps));
  afterAll(async () => await driver.quit());

  afterEach(async () => {
    await driver.closeApp();
    await driver.launchApp();
  });

  it('Connect to server', async () => {
    await driver.elementByClassName('XCUIElementTypeTextField').sendKeys(options.validServer);
    await driver.elementByAccessibilityId('Enter').click();
    expect(await driver.hasElementByAccessibilityId('Sign in')).toBe(true);
  });

  it('Sign in using dev server', async () => {
    await driver.elementByClassName('XCUIElementTypeTextField').sendKeys(options.validServer);
    await driver.elementByAccessibilityId('Enter').click();
    await driver.elementByAccessibilityId('Sign in with dev account').click();
    await driver.elementByAccessibilityId(options.validEmail).click();
    expect(await driver.waitForElementByAccessibilityId('Home', 10000).text()).toEqual('Home');
  });
});
