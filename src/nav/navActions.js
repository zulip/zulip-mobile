/* @flow strict-local */
import {
  type PopAction,
  StackActions,
  CommonActions,
  type NavigationAction,
} from '@react-navigation/native';

import * as NavigationService from './NavigationService';
import type { Message, Narrow, UserId, EmojiType } from '../types';
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

export const resetToAccountPicker = (): NavigationAction =>
  CommonActions.reset({ index: 0, routes: [{ name: 'account-pick' }] });

export const resetToMainTabs = (): NavigationAction =>
  CommonActions.reset({ index: 0, routes: [{ name: 'main-tabs' }] });

/*
 * Ordinary "push" actions that will push to the stack.
 */

/** Only call this via `doNarrow`.  See there for details. */
export const navigateToChat = (narrow: Narrow): NavigationAction =>
  // This route name 'chat' appears in one more place than usual: doEventActionSideEffects.js .
  StackActions.push('chat', { narrow, editMessage: null });

export const replaceWithChat = (narrow: Narrow): NavigationAction =>
  StackActions.replace('chat', { narrow, editMessage: null });

export const navigateToUsersScreen = (): NavigationAction => StackActions.push('users');

export const navigateToSearch = (): NavigationAction => StackActions.push('search-messages');

export const navigateToEmojiPicker = (
  onPressEmoji: ({| +type: EmojiType, +code: string, +name: string |}) => void,
): NavigationAction => StackActions.push('emoji-picker', { onPressEmoji });

export const navigateToAuth = (serverSettings: ApiResponseServerSettings): NavigationAction =>
  StackActions.push('auth', { serverSettings });

export const navigateToDevAuth = (args: {| realm: URL |}): NavigationAction =>
  StackActions.push('dev-auth', { realm: args.realm });

export const navigateToPasswordAuth = (args: {|
  realm: URL,
  requireEmailFormat: boolean,
|}): NavigationAction =>
  StackActions.push('password-auth', {
    realm: args.realm,
    requireEmailFormat: args.requireEmailFormat,
  });

export const navigateToAccountPicker = (): NavigationAction => StackActions.push('account-pick');

export const navigateToAccountDetails = (userId: UserId): NavigationAction =>
  StackActions.push('account-details', { userId });

export const navigateToPmConversationDetails = (recipients: PmKeyRecipients): NavigationAction =>
  StackActions.push('pm-conversation-details', { recipients });

export const navigateToRealmInputScreen = (): NavigationAction =>
  StackActions.push('realm-input', { initial: undefined });

export const navigateToLightbox = (src: string, message: Message): NavigationAction =>
  StackActions.push('lightbox', { src, message });

export const navigateToLanguage = (): NavigationAction => StackActions.push('language');

export const navigateToCreateGroup = (): NavigationAction => StackActions.push('create-group');

export const navigateToDiagnostics = (): NavigationAction => StackActions.push('diagnostics');

export const navigateToVariables = (): NavigationAction => StackActions.push('variables');

export const navigateToTiming = (): NavigationAction => StackActions.push('timing');

export const navigateToStorage = (): NavigationAction => StackActions.push('storage');

export const navigateToDebug = (): NavigationAction => StackActions.push('debug');

export const navigateToStream = (streamId: number): NavigationAction =>
  StackActions.push('stream-settings', { streamId });

export const navigateToTopicList = (streamId: number): NavigationAction =>
  StackActions.push('topic-list', { streamId });

export const navigateToCreateStream = (): NavigationAction => StackActions.push('create-stream');

export const navigateToEditStream = (streamId: number): NavigationAction =>
  StackActions.push('edit-stream', { streamId });

export const navigateToStreamSubscribers = (streamId: number): NavigationAction =>
  StackActions.push('invite-users', { streamId });

export const navigateToNotifications = (): NavigationAction => StackActions.push('notifications');

export const navigateToMessageReactionScreen = (
  messageId: number,
  reactionName?: string,
): NavigationAction => StackActions.push('message-reactions', { messageId, reactionName });

export const navigateToLegal = (): NavigationAction => StackActions.push('legal');

export const navigateToUserStatus = (): NavigationAction => StackActions.push('user-status');

export const navigateToSharing = (sharedData: SharedData): NavigationAction =>
  StackActions.push('sharing', { sharedData });

export const navigateToSettings = (): NavigationAction => StackActions.push('settings');
