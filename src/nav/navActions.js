import { NavigationActions } from 'react-navigation';

export const navigateBack = () =>
  NavigationActions.back();

export const navigateToAllStreams = () =>
  NavigationActions.navigate({ routeName: 'subscriptions' });

export const navigateToUsersScreen = () =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = () =>
  NavigationActions.navigate({ routeName: 'search' });

export const navigateToSettings = () =>
  NavigationActions.navigate({ routeName: 'settings' });

export const navigateToAuth = (authType: string) =>
  NavigationActions.navigate({ routeName: authType });

export const navigateToAccountPicker = () =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string) =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToAddNewAccount = (realm: string) =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });
