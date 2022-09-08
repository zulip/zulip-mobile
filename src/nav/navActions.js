/* @flow strict-local */
import {
  type StackActionType,
  StackActions,
  CommonActions,
  type NavigationAction,
} from '@react-navigation/native';

import * as NavigationService from './NavigationService';
import type { Message, Narrow, UserId, EmojiType } from '../types';
import type { PmKeyRecipients } from '../utils/recipient';
import type { SharedData } from '../sharing/types';

// TODO: Probably just do a StackActions.pop()?
export const navigateBack = (): StackActionType => {
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

export const navigateToEmojiPicker = (
  onPressEmoji: ({| +type: EmojiType, +code: string, +name: string |}) => void,
): NavigationAction => StackActions.push('emoji-picker', { onPressEmoji });

export const navigateToAccountDetails = (userId: UserId): NavigationAction =>
  StackActions.push('account-details', { userId });

export const navigateToPmConversationDetails = (recipients: PmKeyRecipients): NavigationAction =>
  StackActions.push('pm-conversation-details', { recipients });

export const navigateToLightbox = (src: URL, message: Message): NavigationAction =>
  StackActions.push('lightbox', { src, message });

export const navigateToStream = (streamId: number): NavigationAction =>
  StackActions.push('stream-settings', { streamId });

export const navigateToMessageReactionScreen = (
  messageId: number,
  reactionName?: string,
): NavigationAction => StackActions.push('message-reactions', { messageId, reactionName });

export const navigateToReadReceiptsScreen = (messageId: number): NavigationAction =>
  StackActions.push('read-receipts', { messageId });

export const navigateToSharing = (sharedData: SharedData): NavigationAction =>
  StackActions.push('sharing', { sharedData });
