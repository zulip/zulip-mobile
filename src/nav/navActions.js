/* @flow strict-local */
import { StackActions, NavigationActions } from 'react-navigation';

import type { NavigationAction, Message, Narrow, SharedData } from '../types';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { getSameRoutesCount } from '../selectors';

export const navigateBack = (): NavigationAction => StackActions.pop({ n: getSameRoutesCount() });

/*
 * "Reset" actions, to explicitly prohibit back navigation.
 */

export const resetToLoading = (): NavigationAction =>
  StackActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'loading' })] });

export const resetToRealmScreen = (
  args: { realm?: URL, initial?: boolean } = {},
): NavigationAction =>
  StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: 'realm',
        params: { realm: args.realm, initial: args.initial },
      }),
    ],
  });

export const resetToAccountPicker = (): NavigationAction =>
  StackActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'account' })] });

export const resetToMainTabs = (): NavigationAction =>
  StackActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'main' })] });

/*
 * Ordinary "push" actions that will push to the stack.
 */

/** Only call this via `doNarrow`.  See there for details. */
export const navigateToChat = (narrow: Narrow): NavigationAction =>
  StackActions.push({ routeName: 'chat', params: { narrow } });

export const navigateToUsersScreen = (): NavigationAction =>
  StackActions.push({ routeName: 'users' });

export const navigateToSearch = (): NavigationAction => StackActions.push({ routeName: 'search' });

export const navigateToEmojiPicker = (messageId: number): NavigationAction =>
  StackActions.push({ routeName: 'emoji-picker', params: { messageId } });

export const navigateToAuth = (serverSettings: ApiResponseServerSettings): NavigationAction =>
  StackActions.push({ routeName: 'auth', params: { serverSettings } });

export const navigateToDev = (): NavigationAction => StackActions.push({ routeName: 'dev' });

export const navigateToPassword = (requireEmailFormat: boolean): NavigationAction =>
  StackActions.push({ routeName: 'password', params: { requireEmailFormat } });

export const navigateToAccountPicker = (): NavigationAction =>
  StackActions.push({ routeName: 'account' });

export const navigateToAccountDetails = (userId: number): NavigationAction =>
  StackActions.push({ routeName: 'account-details', params: { userId } });

export const navigateToGroupDetails = (recipients: $ReadOnlyArray<number>): NavigationAction =>
  StackActions.push({ routeName: 'group-details', params: { recipients } });

export const navigateToRealmScreen = (
  args: { realm?: URL, initial?: boolean } = {},
): NavigationAction =>
  StackActions.push({ routeName: 'realm', params: { realm: args.realm, initial: args.initial } });

export const navigateToLightbox = (src: string, message: Message): NavigationAction =>
  StackActions.push({ routeName: 'lightbox', params: { src, message } });

export const navigateToLanguage = (): NavigationAction =>
  StackActions.push({ routeName: 'language' });

export const navigateToCreateGroup = (): NavigationAction =>
  StackActions.push({ routeName: 'group' });

export const navigateToDiagnostics = (): NavigationAction =>
  StackActions.push({ routeName: 'diagnostics' });

export const navigateToVariables = (): NavigationAction =>
  StackActions.push({ routeName: 'variables' });

export const navigateToTiming = (): NavigationAction => StackActions.push({ routeName: 'timing' });

export const navigateToStorage = (): NavigationAction =>
  StackActions.push({ routeName: 'storage' });

export const navigateToDebug = (): NavigationAction => StackActions.push({ routeName: 'debug' });

export const navigateToStream = (streamId: number): NavigationAction =>
  StackActions.push({ routeName: 'stream', params: { streamId } });

export const navigateToTopicList = (streamId: number): NavigationAction =>
  StackActions.push({ routeName: 'topics', params: { streamId } });

export const navigateToCreateStream = (): NavigationAction =>
  StackActions.push({ routeName: 'stream-create' });

export const navigateToEditStream = (streamId: number): NavigationAction =>
  StackActions.push({ routeName: 'stream-edit', params: { streamId } });

export const navigateToStreamSubscribers = (streamId: number): NavigationAction =>
  StackActions.push({ routeName: 'invite-users', params: { streamId } });

export const navigateToNotifications = (): NavigationAction =>
  StackActions.push({ routeName: 'notifications' });

export const navigateToMessageReactionScreen = (
  messageId: number,
  reactionName?: string,
): NavigationAction =>
  StackActions.push({ routeName: 'message-reactions', params: { messageId, reactionName } });

export const navigateToLegal = (): NavigationAction => StackActions.push({ routeName: 'legal' });

export const navigateToUserStatus = (): NavigationAction =>
  StackActions.push({ routeName: 'user-status' });

export const navigateToSharing = (sharedData: SharedData): NavigationAction =>
  StackActions.push({ routeName: 'sharing', params: { sharedData } });
