/* @flow strict-local */
import { authFromCallbackUrl } from '../webAuth';
import * as eg from '../../__tests__/lib/exampleData';

describe('authFromCallbackUrl', () => {
  const otp = '13579bdf';

  test('success', () => {
    const url = `zulip://login?realm=${eg.realm.toString()}&email=a@b&otp_encrypted_api_key=2636fdeb`;
    expect(authFromCallbackUrl(url, otp, eg.realm)).toEqual({
      realm: eg.realm,
      email: 'a@b',
      apiKey: '5af4',
    });
  });

  test('wrong realm', () => {
    const url =
      'zulip://login?realm=https://other.example.org&email=a@b&otp_encrypted_api_key=2636fdeb';
    expect(authFromCallbackUrl(url, otp, eg.realm)).toEqual(null);
  });

  test('not login', () => {
    // Hypothetical link that isn't a login... but somehow with all the same
    // query params, for extra confusion for good measure.
    const url = `zulip://message?realm=${eg.realm.toString()}&email=a@b&otp_encrypted_api_key=2636fdeb`;
    expect(authFromCallbackUrl(url, otp, eg.realm)).toEqual(null);
  });
});
