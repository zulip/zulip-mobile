export const getActiveAccount = (state) =>
  state.accountlist.get(0) || {};

export const getAuth = (state) => {
  const account = getActiveAccount(state);
  return {
    email: account.email,
    apiKey: account.apiKey,
    realm: account.realm,
  };
};
