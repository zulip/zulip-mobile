/* @flow */
import { NavigationActions } from 'react-navigation';

import type { Action, Message } from '../types';
import { RESET_NAVIGATION } from '../actionConstants';

export const resetNavigation = (): Action => ({
  type: RESET_NAVIGATION,
});

export const navigateBack = (): Action => NavigationActions.back();

export const navigateToAllStreams = (): Action =>
  NavigationActions.navigate({ routeName: 'subscriptions' });

export const navigateToUsersScreen = (): Action =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = (): Action => NavigationActions.navigate({ routeName: 'search' });

export const navigateToSettings = (): Action =>
  NavigationActions.navigate({ routeName: 'settings' });

export const navigateToAuth = (authType: string): Action =>
  NavigationActions.navigate({ routeName: authType });

export const navigateToAccountPicker = (): Action =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): Action =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToAddNewAccount = (realm: string): Action =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): Action =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });
