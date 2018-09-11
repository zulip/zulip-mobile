/* @flow strict-local */
import { NavigationActions } from 'react-navigation';

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
  // $FlowFixMe
  dispatch(NavigationActions.pop({ n: getSameRoutesCount(getState()) }));

// Other stack routes reached through `navReducer`:
//    NavigationActions.navigate({ routeName: 'loading' });
//    NavigationActions.navigate({ routeName: 'welcome' });
//    NavigationActions.navigate({ routeName: 'account' });
//    NavigationActions.navigate({ routeName: 'main' });

/** Only call this via `doNarrow`.  See there for details. */
export const navigateToChat = (narrow: Narrow): NavigationAction =>
  NavigationActions.navigate({ routeName: 'chat', params: { narrow } });

export const navigateToUsersScreen = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'search' });

export const navigateToEmojiPicker = (messageId: number): NavigationAction =>
  NavigationActions.navigate({ routeName: 'emoji-picker', params: { messageId } });

export const navigateToAuth = (serverSettings: ApiResponseServerSettings): NavigationAction =>
  NavigationActions.navigate({ routeName: 'auth', params: { serverSettings } });

export const navigateToDev = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'dev' });

export const navigateToPassword = (requireEmailFormat: boolean): NavigationAction =>
  NavigationActions.navigate({ routeName: 'password', params: { requireEmailFormat } });

export const navigateToAccountPicker = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): NavigationAction =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: UserOrBot[]): NavigationAction =>
  NavigationActions.navigate({ routeName: 'group-details', params: { recipients } });

export const navigateToRealmScreen = (realm?: string): NavigationAction =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): NavigationAction =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });

export const navigateToLanguage = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'language' });

export const navigateToCreateGroup = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'group' });

export const navigateToDiagnostics = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'diagnostics' });

export const navigateToWelcomeHelp = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'welcome-help' });

export const navigateToVariables = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'variables' });

export const navigateToTiming = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'timing' });

export const navigateToStorage = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'storage' });

export const navigateToDebug = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'debug' });

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

export const navigateToUserStatus = (): NavigationAction =>
  NavigationActions.navigate({ routeName: 'user-status' });
