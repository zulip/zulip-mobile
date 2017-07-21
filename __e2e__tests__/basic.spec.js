/* eslint-disable */
import detox from 'detox';
import config from '../package.json';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const options = {
  validHostUrl: 'http://localhost:9991',
  invalidHostUrl: 'http://invalid:9991',
  testDevAuthEmail: 'iago@zulip.com'
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
    await expect(
      element(by.text('Can not connect to server').and(by.type('RCTText')))
    ).toBeVisible();
  });
});
