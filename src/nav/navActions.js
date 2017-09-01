/* TODO flow */
import { NavigationActions } from 'react-navigation';

import type { Action, Message, UserType, ImageResource } from '../types';
import { RESET_NAVIGATION } from '../actionConstants';

export const resetNavigation = (): Action => ({
  type: RESET_NAVIGATION,
});

export const navigateBack = (): Action => NavigationActions.back();

export const navigateToChat = (): Action => NavigationActions.navigate({ routeName: 'chat' });

export const navigateToAllStreams = (): Action =>
  NavigationActions.navigate({ routeName: 'subscriptions' });

export const navigateToUsersScreen = (): Action =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = (): Action => NavigationActions.navigate({ routeName: 'search' });

export const navigateToSettings = (): Action =>
  NavigationActions.navigate({ routeName: 'settings' });

// Use this to navigate to the unread cards screen
export const navigateToUnreadCards = (): Action =>
  NavigationActions.navigate({ routeName: 'unreadCards' });

export const navigateToAuth = (authBackends: string): Action =>
  NavigationActions.navigate({ routeName: 'auth', params: { authBackends } });

export const navigateToDev = (): Action => NavigationActions.navigate({ routeName: 'dev' });

export const navigateToAccountPicker = (): Action =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): Action =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: UserType): Action =>
  NavigationActions.navigate({ routeName: 'group-details', params: { recipients } });

export const navigateToAddNewAccount = (): Action =>
  NavigationActions.navigate({ routeName: 'realm' });

export const navigateToLightbox = (src: ImageResource, message: Message): Action =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });

export const navigateToLoading = (): Action => NavigationActions.navigate({ routeName: 'loading' });

export const navigateToSettingsDetail = (setting: string, title: string): Action =>
  NavigationActions.navigate({ routeName: 'settings-detail', params: { setting, title } });

export const navigateToCreateGroup = (): Action =>
  NavigationActions.navigate({ routeName: 'group' });
