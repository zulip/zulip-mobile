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

// TODO(server-2.1): Delete this (and the logic it tests.)
describe('activeAuthentications: old server API', () => {
  test('empty auth methods object result in no available authentications', () => {
    const authenticationMethods = {};

    const actual = activeAuthentications(authenticationMethods, undefined);

    expect(actual).toEqual([]);
  });

  test('two auth methods enabled result in two-item list', () => {
    const authenticationMethods = {
      dev: true,
      password: true,
    };

    const actual = activeAuthentications(authenticationMethods, undefined);

    expect(actual).toHaveLength(2);
  });

  test('ldap and password are handled the same so do not duplicate them', () => {
    const authenticationMethods = {
      ldap: true,
      password: true,
    };

    const actual = activeAuthentications(authenticationMethods, undefined);

    expect(actual).toHaveLength(1);
  });

  test('recognizes all auth methods and returns them as a list with details', () => {
    const authenticationMethods = {
      dev: true,
      github: true,
      azuread: true,
      google: true,
      ldap: true,
      password: true,
      remoteuser: true,
    };

    const actual = activeAuthentications(authenticationMethods, undefined);

    expect(actual).toHaveLength(6);
  });

  test('only recognized auth methods are returned while the unknown are ignored', () => {
    const authenticationMethods = {
      password: true,
      unknown: true,
    };

    const actual = activeAuthentications(authenticationMethods, undefined);

    expect(actual).toHaveLength(1);
  });
});
