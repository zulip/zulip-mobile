import { fromJS } from 'immutable';

export const getActiveAccount = (state) =>
  state.accountlist.get(0);

export const getAuth = (state) => {
  const account = getActiveAccount(state);
  return fromJS({
    apiKey: account.get('apiKey'),
    email: account.get('email'),
    realm: account.get('realm'),
  });
};
