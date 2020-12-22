/* @flow strict-local */
import type { Account, Auth, Identity } from '../types';

const identitySlice = ({ realm, email }): Identity => ({ realm, email });

export const identityOfAuth: Auth => Identity = identitySlice;

export const identityOfAccount: Account => Identity = identitySlice;

/** A string corresponding uniquely to an identity, for use in `Map`s. */
export const keyOfIdentity = ({ realm, email }: Identity): string =>
  `${realm.toString()}\0${email}`;

export const authOfAccount = (account: Account): Auth => {
  const { realm, email, apiKey } = account;
  return { realm, email, apiKey };
};
