import { activeAuthentications } from '../authentications';

describe('activeAuthentications', () => {
  test('empty auth methods object result in no available authentications', () => {
    const authenticationMethods = {};

    const actual = activeAuthentications(authenticationMethods);

    expect(actual).toEqual([]);
  });

  test('two auth methods enabled result in two-item list', () => {
    const authenticationMethods = {
      dev: true,
      password: true,
    };

    const actual = activeAuthentications(authenticationMethods);

    expect(actual).toHaveLength(2);
  });

  test('ldap and password are handled the same so do not duplicate them', () => {
    const authenticationMethods = {
      ldap: true,
      password: true,
    };

    const actual = activeAuthentications(authenticationMethods);

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

    const actual = activeAuthentications(authenticationMethods);

    expect(actual).toHaveLength(6);
  });

  test('only recognized auth methods are returned while the unknown are ignored', () => {
    const authenticationMethods = {
      password: true,
      unknown: true,
    };

    const actual = activeAuthentications(authenticationMethods);

    expect(actual).toHaveLength(1);
  });
});
