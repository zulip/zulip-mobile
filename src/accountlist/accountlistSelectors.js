import { fromJS } from 'immutable';

export const getActiveAccount = (state) =>
  state.accountlist.get(0);

export const getAuth = (state) => {
  const account = getActiveAccount(state);
  return fromJS({
    email: account.get('email'),
    apiKey: account.get('apiKey'),
    realm: account.get('realm'),
  });
};
