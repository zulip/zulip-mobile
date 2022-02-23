/* @flow strict-local */
import {
  type PopAction,
  StackActions,
  CommonActions,
  type GenericNavigationAction,
} from '@react-navigation/native';

import * as NavigationService from './NavigationService';
import type { Message, Narrow, UserId } from '../types';
import type { PmKeyRecipients } from '../utils/recipient';
import type { SharedData } from '../sharing/types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';

// TODO: Probably just do a StackActions.pop()?
export const navigateBack = (): PopAction => {
  const routes = NavigationService.getState().routes;
  let i = routes.length - 1;
  while (i >= 0) {
    if (routes[i].name !== routes[routes.length - 1].name) {
      break;
    }
    i--;
  }
  const sameRoutesCount = routes.length - i - 1;
  return StackActions.pop(sameRoutesCount);
};

/*
 * "Reset" actions, to explicitly prohibit back navigation.
 */

export const resetToAccountPicker = (): GenericNavigationAction =>
  CommonActions.reset({ index: 0, routes: [{ name: 'account-pick' }] });

export const resetToMainTabs = (): GenericNavigationAction =>
  CommonActions.reset({ index: 0, routes: [{ name: 'main-tabs' }] });

/*
 * Ordinary "push" actions that will push to the stack.
 */

/** Only call this via `doNarrow`.  See there for details. */
export const navigateToChat = (narrow: Narrow): GenericNavigationAction =>
  // This route name 'chat' appears in one more place than usual: doEventActionSideEffects.js .
  StackActions.push('chat', { narrow, editMessage: null });

export const replaceWithChat = (narrow: Narrow): GenericNavigationAction =>
  StackActions.replace('chat', { narrow, editMessage: null });

export const navigateToUsersScreen = (): GenericNavigationAction => StackActions.push('users');

export const navigateToSearch = (): GenericNavigationAction => StackActions.push('search-messages');

export const navigateToEmojiPicker = (messageId: number): GenericNavigationAction =>
  StackActions.push('emoji-picker', { messageId });

export const navigateToAuth = (
  serverSettings: ApiResponseServerSettings,
): GenericNavigationAction => StackActions.push('auth', { serverSettings });

export const navigateToDevAuth = (args: {| realm: URL |}): GenericNavigationAction =>
  StackActions.push('dev-auth', { realm: args.realm });

export const navigateToPasswordAuth = (args: {|
  realm: URL,
  requireEmailFormat: boolean,
|}): GenericNavigationAction =>
  StackActions.push('password-auth', {
    realm: args.realm,
    requireEmailFormat: args.requireEmailFormat,
  });

export const navigateToAccountPicker = (): GenericNavigationAction =>
  StackActions.push('account-pick');

export const navigateToAccountDetails = (userId: UserId): GenericNavigationAction =>
  StackActions.push('account-details', { userId });

export const navigateToPmConversationDetails = (
  recipients: PmKeyRecipients,
): GenericNavigationAction => StackActions.push('pm-conversation-details', { recipients });

export const navigateToRealmInputScreen = (): GenericNavigationAction =>
  StackActions.push('realm-input', { initial: undefined });

export const navigateToLightbox = (src: string, message: Message): GenericNavigationAction =>
  StackActions.push('lightbox', { src, message });

export const navigateToLanguage = (): GenericNavigationAction => StackActions.push('language');

export const navigateToCreateGroup = (): GenericNavigationAction =>
  StackActions.push('create-group');

export const navigateToDiagnostics = (): GenericNavigationAction =>
  StackActions.push('diagnostics');

export const navigateToVariables = (): GenericNavigationAction => StackActions.push('variables');

export const navigateToTiming = (): GenericNavigationAction => StackActions.push('timing');

export const navigateToStorage = (): GenericNavigationAction => StackActions.push('storage');

export const navigateToDebug = (): GenericNavigationAction => StackActions.push('debug');

export const navigateToStream = (streamId: number): GenericNavigationAction =>
  StackActions.push('stream-settings', { streamId });

export const navigateToTopicList = (streamId: number): GenericNavigationAction =>
  StackActions.push('topic-list', { streamId });

export const navigateToCreateStream = (): GenericNavigationAction =>
  StackActions.push('create-stream');

export const navigateToEditStream = (streamId: number): GenericNavigationAction =>
  StackActions.push('edit-stream', { streamId });

export const navigateToStreamSubscribers = (streamId: number): GenericNavigationAction =>
  StackActions.push('invite-users', { streamId });

export const navigateToNotifications = (): GenericNavigationAction =>
  StackActions.push('notifications');

export const navigateToMessageReactionScreen = (
  messageId: number,
  reactionName?: string,
): GenericNavigationAction => StackActions.push('message-reactions', { messageId, reactionName });

export const navigateToLegal = (): GenericNavigationAction => StackActions.push('legal');

export const navigateToUserStatus = (): GenericNavigationAction => StackActions.push('user-status');

export const navigateToSharing = (sharedData: SharedData): GenericNavigationAction =>
  StackActions.push('sharing', { sharedData });

export const navigateToSettings = (): GenericNavigationAction => StackActions.push('settings');
