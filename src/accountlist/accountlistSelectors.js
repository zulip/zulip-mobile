export const getActiveAccount = (state) =>
  state.accountlist.get(0);

export const getAuth = (state) => {
  const account = getActiveAccount(state);
  return {
    email: account.get('email'),
    apiKey: account.get('apiKey'),
    realm: account.get('realm'),
  };
};
