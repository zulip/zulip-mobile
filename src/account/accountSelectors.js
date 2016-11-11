import { fromJS } from 'immutable';

export const getActiveAccount = (state) =>
  state.account.get(0);

export const getAuth = (state) => {
  const account = getActiveAccount(state);

  if (!account) {
    return fromJS({
      apiKey: undefined,
      email: undefined,
      realm: undefined,
    });
  }

  return fromJS({
    apiKey: account.get('apiKey'),
    email: account.get('email'),
    realm: account.get('realm'),
  });
};
