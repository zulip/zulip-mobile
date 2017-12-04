/* @noflow */
import { NavigationActions } from 'react-navigation';

import type { Action, Message, UserType, ServerSettings } from '../types';
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

export const navigateToAuth = (serverSettings: ServerSettings): Action =>
  NavigationActions.navigate({ routeName: 'auth', params: { serverSettings } });

export const navigateToDev = (): Action => NavigationActions.navigate({ routeName: 'dev' });

export const navigateToAccountPicker = (): Action =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): Action =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: UserType): Action =>
  NavigationActions.navigate({ routeName: 'group-details', params: { recipients } });

export const navigateToAddNewAccount = (realm: string): Action =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): Action =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });

export const navigateToLoading = (): Action => NavigationActions.navigate({ routeName: 'loading' });

export const navigateToLanguage = (): Action =>
  NavigationActions.navigate({ routeName: 'language' });

export const navigateToCreateGroup = (): Action =>
  NavigationActions.navigate({ routeName: 'group' });

export const navigateToDiagnostics = (): Action =>
  NavigationActions.navigate({ routeName: 'diagnostics' });

export const navigateToVariables = (): Action =>
  NavigationActions.navigate({ routeName: 'variables' });

export const navigateToTiming = (): Action => NavigationActions.navigate({ routeName: 'timing' });

export const navigateToStorage = (): Action => NavigationActions.navigate({ routeName: 'storage' });

export const navigateToDebug = (): Action => NavigationActions.navigate({ routeName: 'debug' });

export const navigateToCreateStream = (): Action =>
  NavigationActions.navigate({ routeName: 'stream-create' });

export const navigateToNotifications = (): Action =>
  NavigationActions.navigate({ routeName: 'notifications' });
