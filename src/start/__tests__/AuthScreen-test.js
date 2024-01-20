/* @flow strict-local */

import { activeAuthentications } from '../AuthScreen';

describe('activeAuthentications: external_authentication_methods (server v2.1+ API)', () => {
  test('clobbers hardcoded info for same methods', () => {
    expect(
      activeAuthentications({ google: true }, [
        {
          name: 'google',
          signup_url: '/accounts/register/social/google',
          display_icon: '/static/images/landing-page/logos/googl_e-icon.png',
          display_name: 'Google',
          login_url: '/accounts/login/social/google',
        },
      ]),
    ).toMatchObject([
      {
        name: 'google',
        displayName: 'Google',
        // NB different from hardcoded URL for same method
        action: { url: '/accounts/login/social/google' },
      },
    ]);
  });

  test('supplements internal methods', () => {
    expect(activeAuthentications({ password: true, google: true }, [])).toMatchObject([
      { name: 'password' },
    ]);
  });

  test('handles example SAML data', () => {
    expect(
      activeAuthentications({ saml: true }, [
        {
          name: 'saml:okta',
          display_name: 'SAML',
          display_icon: null,
          login_url: '/accounts/login/social/saml/okta',
          signup_url: '/accounts/register/social/saml/okta',
        },
      ]),
    ).toMatchObject([
      {
        name: 'saml:okta',
        displayName: 'SAML',
        action: { url: '/accounts/login/social/saml/okta' },
      },
    ]);
  });
});
