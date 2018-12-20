/* @flow strict-local */
import type { AuthenticationMethods } from '../types';
import { IconPrivate, IconGoogle, IconGitHub, IconWindows, IconTerminal } from '../common/Icons';
import type { IconType } from '../common/Icons';

type AuthenticationMethodDetails = {|
  method: string,
  name: string,
  Icon: IconType,
  handler: string,
|};

const authentications: AuthenticationMethodDetails[] = [
  {
    method: 'dev',
    name: 'dev account',
    Icon: IconTerminal,
    handler: 'handleDevAuth',
  },
  {
    method: 'password',
    name: 'password',
    Icon: IconPrivate,
    handler: 'handlePassword',
  },
  {
    method: 'ldap',
    name: 'password',
    Icon: IconPrivate,
    handler: 'handlePassword',
  },
  {
    method: 'google',
    name: 'Google',
    Icon: IconGoogle,
    handler: 'handleGoogle',
  },
  {
    method: 'github',
    name: 'GitHub',
    Icon: IconGitHub,
    handler: 'handleGitHub',
  },
  {
    method: 'azuread',
    name: 'Azure AD',
    Icon: IconWindows,
    handler: 'handleAzureAD',
  },
  {
    method: 'remoteuser',
    name: 'SSO',
    Icon: IconPrivate,
    handler: 'handleSso',
  },
];

export const activeAuthentications = (
  authenticationMethods: AuthenticationMethods,
): AuthenticationMethodDetails[] =>
  authentications.filter(
    auth =>
      authenticationMethods[auth.method]
      && (auth.method !== 'ldap' || !authenticationMethods.password),
  );
