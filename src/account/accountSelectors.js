export const getActiveAccount = (state) =>
  state.account[0];

export const getAuth = (state) => {
  const account = getActiveAccount(state);

  if (!account) {
    return {
      apiKey: undefined,
      email: undefined,
      realm: undefined,
    };
  }

  return {
    apiKey: account.apiKey,
    email: account.email,
    realm: account.realm,
  };
};
