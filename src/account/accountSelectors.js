export const getActiveAccount = state =>
  state.account ? state.account[0] : undefined;

export const getAuth = state => {
  const account = getActiveAccount(state);

  if (!account) {
    return {
      apiKey: undefined,
      email: undefined,
      realm: undefined,
    };
  }

  // Returning a copy here (instead of the original object)
  // causes all components in the app to re-render
  return account;
};
