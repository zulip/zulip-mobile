/* @flow strict-local */
import { authFromCallbackUrl } from '../webAuth';

describe('authFromCallbackUrl', () => {
  const otp = '13579bdf';
  const realm = 'https://chat.example/';

  test('success', () => {
    const url = `zulip://login?realm=${realm}&email=a@b&otp_encrypted_api_key=2636fdeb`;
    expect(authFromCallbackUrl(url, otp, realm)).toEqual({
      realm: new URL(realm),
      email: 'a@b',
      apiKey: '5af4',
    });
  });

  test('wrong realm', () => {
    const url =
      'zulip://login?realm=https://other.example.org&email=a@b&otp_encrypted_api_key=2636fdeb';
    expect(authFromCallbackUrl(url, otp, realm)).toEqual(null);
  });

  test('not login', () => {
    // Hypothetical link that isn't a login... but somehow with all the same
    // query params, for extra confusion for good measure.
    const url = `zulip://message?realm=${realm}&email=a@b&otp_encrypted_api_key=2636fdeb`;
    expect(authFromCallbackUrl(url, otp, realm)).toEqual(null);
  });
});
