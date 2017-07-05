/* eslint-disable */
import detox from 'detox';
import config from '../package.json';
import devGetEmails from '../src/api/devGetEmails';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const options = {
  validHostUrl: 'http://localhost:9991',
  invalidHostUrl: 'http://invalid:9991',
  testDevAuthEmail: 'iago@zulip.com',
};

beforeAll(async () => {
  await detox.init(config.detox);
});

afterAll(async () => {
  await detox.cleanup();
});

describe('Authentication screen testing', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('smoke test', async () => {
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('invalid server', async () => {
    await element(by.type('RCTTextField')).clearText();
    await element(by.type('RCTTextField')).replaceText(options.invalidHostUrl);
    await element(by.label('Enter')).tap();
    await expect(element(by.text('Can not connect to server').and(by.type('RCTText')))).toBeVisible();
  });

  it('valid server', async () => {
    await element(by.type('RCTTextField')).clearText();
    await element(by.type('RCTTextField')).replaceText(options.validHostUrl);
    await element(by.type('RCTView').withDescendant(by.type('RCTText').and(by.label('Enter')))).atIndex(0).tap();
    await expect(element(by.text('Sign in'))).toBeVisible();
  });

  it('Test dev auth backend login', async () => {
    await waitFor(element(by.type('RCTTextField'))).toBeVisible().withTimeout(6000);
    // await element(by.type('RCTTextField')).atIndex[0].clearText();
    await element(by.type('RCTTextField')).replaceText(options.validHostUrl);
    await element(by.type('RCTView').withDescendant(by.type('RCTText').and(by.label('Enter')))).atIndex(0).tap();
    await element(by.text('Sign in with dev account')).tap();
    await expect(element(by.text(options.testDevAuthEmail))).toBeVisible();
    await element(by.text(options.testDevAuthEmail)).tap();
    await device.disableSynchronization();
    await waitFor(element(by.text('Home').and(by.type('RCTText')))).toBeVisible().withTimeout(6000);
    await expect(element(by.text('Home').and(by.type('RCTText')))).toBeVisible();
  });
})
