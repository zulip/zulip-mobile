/* @flow strict-local */
import {
  StackActions,
  CommonActions,
  type GenericNavigationAction,
} from '@react-navigation/native';

import type { Message, Narrow, SharedData, UserId } from '../types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { getSameRoutesCount } from '../selectors';

export const navigateBack = (): GenericNavigationAction => StackActions.pop(getSameRoutesCount());

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
  StackActions.push('chat', { narrow });

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
  requireEmailFormat: boolean,
|}): GenericNavigationAction =>
  StackActions.push('password-auth', { requireEmailFormat: args.requireEmailFormat });

export const navigateToAccountPicker = (): GenericNavigationAction =>
  StackActions.push('account-pick');

export const navigateToAccountDetails = (userId: UserId): GenericNavigationAction =>
  StackActions.push('account-details', { userId });

export const navigateToGroupDetails = (
  recipients: $ReadOnlyArray<UserId>,
): GenericNavigationAction => StackActions.push('group-details', { recipients });

export const navigateToRealmInputScreen = (
  // The `Object.freeze`` in the `:` case avoids a Flow issue:
  // https://github.com/facebook/flow/issues/2386#issuecomment-695064325
  args: {| realm?: URL, initial?: boolean |} = Object.freeze({}),
): GenericNavigationAction =>
  StackActions.push('realm-input', { realm: args.realm, initial: args.initial });

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
