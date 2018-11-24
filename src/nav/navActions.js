/* @flow */
import { NavigationActions } from 'react-navigation';

import type { NavigationAction, Message, Narrow, ApiServerSettings } from '../types';
import * as routes from './routeConstants';

export const navigateBack = (): NavigationAction => NavigationActions.back();

export const navigateToChat = (narrow: Narrow): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Chat, params: { narrow } });

export const navigateToAllStreams = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Subscriptions });

export const navigateToUsersScreen = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Users });

export const navigateToSearch = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.SearchMessages });

export const navigateToSettings = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Settings });

export const navigateToEmojiPicker = (messageId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.EmojiPicker, params: { messageId } });

export const navigateToAuth = (serverSettings: ApiServerSettings): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Auth, params: { serverSettings } });

export const navigateToDev = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.DevAuth });

export const navigateToPassword = (requireEmailFormat: boolean): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.PasswordAuth, params: { requireEmailFormat } });

export const navigateToAccountPicker = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.AccountPick });

export const navigateToAccountDetails = (email: string): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.AccountDetails, params: { email } });

export const navigateToGroupDetails = (recipients: string[]): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.GroupDetails, params: { recipients } });

export const navigateToRealmScreen = (realm?: string): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Realm, params: { realm } });

export const navigateToLightbox = (src: string, message: Message): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Lightbox, params: { src, message } });

export const navigateToLoading = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Loading });

export const navigateToLanguage = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Language });

export const navigateToCreateGroup = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.CreateGroup });

export const navigateToDiagnostics = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Diagnostics });

export const navigateToWelcomeHelp = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.WelcomeHelp });

export const navigateToWelcomeScreen = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Welcome });

export const navigateToVariables = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Variables });

export const navigateToTiming = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Timing });

export const navigateToStorage = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Storage });

export const navigateToDebug = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Debug });

export const navigateToNotifDiag = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.NotificationDiag });

export const navigateToStream = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Stream, params: { streamId } });

export const navigateToTopicList = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.TopicList, params: { streamId } });

export const navigateToCreateStream = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.CreateStream });

export const navigateToEditStream = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.EditStream, params: { streamId } });

export const navigateToStreamSubscribers = (streamId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.InviteUsers, params: { streamId } });

export const navigateToNotifications = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Notifications });

export const navigateToLegal = (): NavigationAction =>
  NavigationActions.navigate({ routeName: routes.Legal });
