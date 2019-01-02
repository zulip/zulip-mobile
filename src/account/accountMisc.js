/* @flow strict-local */
import type { Auth, Identity } from '../types';

export const identityOfAuth = (auth: Auth): Identity => {
  const { realm, email } = auth;
  return { realm, email };
};
