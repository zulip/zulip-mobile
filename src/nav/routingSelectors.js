import { AsyncStorage } from 'react-native';

export const getInitialRoutes = (accounts: any[]): string => {
  const activeAccount = accounts[0];

  if (activeAccount && activeAccount.apiKey) {
    return ['main'];
  }

  if (accounts.length > 1) return ['account'];
  return ['tutorial'];
};

export const getCurrentRoute = (state) =>
  state.nav.routes[state.nav.index];
