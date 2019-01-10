/* @flow strict-local */
import { StackActions } from 'react-navigation';

import type {
  Dispatch,
  NavigationAction,
  GetState,
  Message,
  Narrow,
  UserOrBot,
  ApiResponseServerSettings,
} from '../types';
import { getSameRoutesCount } from '../selectors';

export const navigateBack = () => (dispatch: Dispatch, getState: GetState): NavigationAction =>
  dispatch(StackActions.pop({ n: getSameRoutesCount(getState()) }));

// Other stack routes reached through `navReducer`:
//    StackActions.push({ routeName: 'loading' });
//    StackActions.push({ routeName: 'welcome' });
//    StackActions.push({ routeName: 'account' });
//    StackActions.push({ routeName: 'main' });

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

export const navigateToAccountDetails = (email: string): NavigationAction =>
  StackActions.push({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: UserOrBot[]): NavigationAction =>
  StackActions.push({ routeName: 'group-details', params: { recipients } });

export const navigateToRealmScreen = (realm?: string): NavigationAction =>
  StackActions.push({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): NavigationAction =>
  StackActions.push({ routeName: 'lightbox', params: { src, message } });

export const navigateToLanguage = (): NavigationAction =>
  StackActions.push({ routeName: 'language' });

export const navigateToCreateGroup = (): NavigationAction =>
  StackActions.push({ routeName: 'group' });

export const navigateToDiagnostics = (): NavigationAction =>
  StackActions.push({ routeName: 'diagnostics' });

export const navigateToWelcomeHelp = (): NavigationAction =>
  StackActions.push({ routeName: 'welcome-help' });

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
