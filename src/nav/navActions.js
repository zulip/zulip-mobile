/* @flow */
import { NavigationActions } from 'react-navigation';

import type { NavigateAction, GetState, Message, Narrow, ApiServerSettings } from '../types';
import { getSameRoutesCount } from '../selectors';

export const navigateBack = () => (dispatch: Dispatch, getState: GetState): NavigateAction =>
  // $FlowFixMe
  dispatch(NavigationActions.pop({ n: getSameRoutesCount(getState()) }));

export const navigateToChat = (narrow: Narrow): NavigateAction =>
  NavigationActions.navigate({ routeName: 'chat', params: { narrow } });

export const navigateToAllStreams = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'subscriptions' });

export const navigateToUsersScreen = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'search' });

export const navigateToSettings = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'settings' });

export const navigateToAuth = (serverSettings: ApiServerSettings): NavigateAction =>
  NavigationActions.navigate({ routeName: 'auth', params: { serverSettings } });

export const navigateToDev = (): NavigateAction => NavigationActions.navigate({ routeName: 'dev' });

export const navigateToPassword = (ldap: boolean = false): NavigateAction =>
  NavigationActions.navigate({ routeName: 'password', params: { ldap } });

export const navigateToAccountPicker = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): NavigateAction =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: string[]): NavigateAction =>
  NavigationActions.navigate({ routeName: 'group-details', params: { recipients } });

export const navigateToAddNewAccount = (realm: string): NavigateAction =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): NavigateAction =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });

export const navigateToLoading = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'loading' });

export const navigateToLanguage = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'language' });

export const navigateToCreateGroup = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'group' });

export const navigateToDiagnostics = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'diagnostics' });

export const navigateToWelcomeHelp = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'welcome-help' });

export const navigateToWelcomeScreen = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'welcome' });

export const navigateToVariables = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'variables' });

export const navigateToTiming = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'timing' });

export const navigateToStorage = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'storage' });

export const navigateToDebug = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'debug' });

export const navigateToNotifDiag = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'notifDiag' });

export const navigateToStream = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'stream', params: { streamId } });

export const navigateToTopicList = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'topics', params: { streamId } });

export const navigateToCreateStream = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'stream-create' });

export const navigateToEditStream = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'stream-edit', params: { streamId } });

export const navigateToNotifications = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'notifications' });
