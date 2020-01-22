/* @flow strict-local */
import type { Account, Auth, Identity } from '../types';

const identitySlice = ({ realm, email }): Identity => ({ realm, email });

export const identityOfAuth: Auth => Identity = identitySlice;

export const identityOfAccount: Account => Identity = identitySlice;

/** A string corresponding uniquely to an identity, for use in `Map`s. */
export const keyOfIdentity = ({ realm, email }: Identity): string => `${realm}\0${email}`;

const keyOfAuth = (auth: Auth): string => keyOfIdentity(identityOfAuth(auth));

export const authOfAccount = (account: Account): Auth => {
  const { realm, email, apiKey } = account;
  return { realm, email, apiKey };
};

/**
 * Takes two Auth objects and confirms that they are equal, either by
 *  1.) strict equality
 *  2.) equality of their identity key (realm + email) and API key
 */
export const authEquivalent = (auth1: Auth | void, auth2: Auth | void): boolean =>
  auth1 === auth2
  || (auth1 !== undefined
    && auth2 !== undefined
    && (auth1.apiKey === auth2.apiKey && keyOfAuth(auth1) === keyOfAuth(auth2)));
