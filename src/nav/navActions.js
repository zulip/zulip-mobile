/* @flow */
import { NavigationActions } from 'react-navigation';

import type { NavigationAction, Message, Narrow, ApiServerSettings } from '../types';

export const navigateBack = (): NavigationAction => NavigationActions.back();

export const navigateToChat = (narrow: Narrow): NavigationAction =>
  NavigationActions.navigate({ routeName: 'chat', params: { narrow } });

export const navigateToAllStreams = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'subscriptions' });

export const navigateToUsersScreen = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'search' });

export const navigateToSettings = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'settings' });

export const navigateToEmojiPicker = (messageId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: 'emoji-picker', params: { messageId } });

export const navigateToAuth = (serverSettings: ApiServerSettings): NavigationAction =>
  NavigationActions.navigate({ routeName: 'auth', params: { serverSettings } });

export const navigateToDev = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'dev' });

export const navigateToPassword = (requireEmailFormat: boolean): NavigationAction =>
  NavigationActions.navigate({ routeName: 'password', params: { requireEmailFormat } });

export const navigateToAccountPicker = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): NavigationAction =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: string[]): NavigationAction =>
  NavigationActions.navigate({ routeName: 'group-details', params: { recipients } });

export const navigateToAddNewAccount = (realm: string): NavigationAction =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): NavigationAction =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });

export const navigateToLoading = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'loading' });

export const navigateToLanguage = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'language' });

export const navigateToCreateGroup = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'group' });

export const navigateToDiagnostics = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'diagnostics' });

export const navigateToWelcomeHelp = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'welcome-help' });

export const navigateToWelcomeScreen = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'welcome' });

export const navigateToVariables = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'variables' });

export const navigateToTiming = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'timing' });

export const navigateToStorage = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'storage' });

export const navigateToDebug = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'debug' });

export const navigateToNotifDiag = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'notifDiag' });

export const navigateToStream = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: 'stream', params: { streamId } });

export const navigateToTopicList = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: 'topics', params: { streamId } });

export const navigateToCreateStream = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'stream-create' });

export const navigateToEditStream = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: 'stream-edit', params: { streamId } });

export const navigateToStreamSubscribers = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: 'invite-users', params: { streamId } });

export const navigateToNotifications = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'notifications' });

export const navigateToLegal = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'legal' });
