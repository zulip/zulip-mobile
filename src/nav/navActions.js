/* @noflow */
import { NavigationActions } from 'react-navigation';

import type { Action, Message, Narrow, UserType, ServerSettings } from '../types';
import { getSameRoutesCount } from '../selectors';

export const navigateBack = (): Actions => (dispatch: Dispatch, getState: GetState) =>
  dispatch(NavigationActions.pop({ n: getSameRoutesCount(getState()) }));

export const navigateToChat = (narrow: Narrow): Action =>
  NavigationActions.navigate({ routeName: 'chat', params: { narrow } });

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

export const navigateToPassword = (ldap: boolean = false): Action =>
  NavigationActions.navigate({ routeName: 'password', params: { ldap } });

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

export const navigateToNotifDiag = (): Action =>
  NavigationActions.navigate({ routeName: 'notifDiag' });

export const navigateToStream = (streamId: number): Action =>
  NavigationActions.navigate({ routeName: 'stream', params: { streamId } });

export const navigateToTopicList = (streamId: number): Action =>
  NavigationActions.navigate({ routeName: 'topics', params: { streamId } });

export const navigateToCreateStream = (): Action =>
  NavigationActions.navigate({ routeName: 'stream-create' });

export const navigateToEditStream = (streamId: number): Action =>
  NavigationActions.navigate({ routeName: 'stream-edit', params: { streamId } });

export const navigateToNotifications = (): Action =>
  NavigationActions.navigate({ routeName: 'notifications' });
