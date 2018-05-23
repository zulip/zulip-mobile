/* @flow */
import type { AuthenticationMethods } from '../types';
import { IconPrivate, IconGoogle, IconGitHub, IconTerminal } from '../common/Icons';

const authentications = [
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
    method: 'remoteuser',
    name: 'SSO',
    Icon: IconPrivate,
    handler: 'handleSso',
  },
];

export const activeAuthentications = (authenticationMethods: AuthenticationMethods) =>
  authentications.filter(
    auth =>
      authenticationMethods[auth.method] &&
      (auth.method !== 'ldap' || !authenticationMethods.password),
  );
