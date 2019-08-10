/* @flow strict-local */
import { NavigationActions } from 'react-navigation';

import type {
  Dispatch,
  NavigateAction,
  GetState,
  Message,
  Narrow,
  UserOrBot,
  ApiResponseServerSettings,
} from '../types';
import { getSameRoutesCount } from '../selectors';

export const navigateBack = () => (dispatch: Dispatch, getState: GetState): NavigateAction =>
  // $FlowFixMe
  dispatch(NavigationActions.pop({ n: getSameRoutesCount(getState()) }));

// Other stack routes reached through `navReducer`:
//    NavigationActions.navigate({ routeName: 'loading' });
//    NavigationActions.navigate({ routeName: 'welcome' });
//    NavigationActions.navigate({ routeName: 'account' });
//    NavigationActions.navigate({ routeName: 'main' });

/** Only call this via `doNarrow`.  See there for details. */
export const navigateToChat = (narrow: Narrow): NavigateAction =>
  NavigationActions.navigate({ routeName: 'chat', params: { narrow } });

export const navigateToUsersScreen = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'users' });

export const navigateToSearch = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'search' });

export const navigateToEmojiPicker = (messageId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'emoji-picker', params: { messageId } });

export const navigateToAuth = (serverSettings: ApiResponseServerSettings): NavigateAction =>
  NavigationActions.navigate({ routeName: 'auth', params: { serverSettings } });

export const navigateToDev = (): NavigateAction => NavigationActions.navigate({ routeName: 'dev' });

export const navigateToPassword = (requireEmailFormat: boolean): NavigateAction =>
  NavigationActions.navigate({ routeName: 'password', params: { requireEmailFormat } });

export const navigateToAccountPicker = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'account' });

export const navigateToAccountDetails = (email: string): NavigateAction =>
  NavigationActions.navigate({ routeName: 'account-details', params: { email } });

export const navigateToGroupDetails = (recipients: UserOrBot[]): NavigateAction =>
  NavigationActions.navigate({ routeName: 'group-details', params: { recipients } });

export const navigateToRealmScreen = (realm?: string): NavigateAction =>
  NavigationActions.navigate({ routeName: 'realm', params: { realm } });

export const navigateToLightbox = (src: string, message: Message): NavigateAction =>
  NavigationActions.navigate({ routeName: 'lightbox', params: { src, message } });

export const navigateToLanguage = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'language' });

export const navigateToCreateGroup = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'group' });

export const navigateToDiagnostics = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'diagnostics' });

export const navigateToWelcomeHelp = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'welcome-help' });

export const navigateToVariables = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'variables' });

export const navigateToTiming = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'timing' });

export const navigateToStorage = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'storage' });

export const navigateToDebug = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'debug' });

export const navigateToStream = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'stream', params: { streamId } });

export const navigateToTopicList = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'topics', params: { streamId } });

export const navigateToCreateStream = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'stream-create' });

export const navigateToEditStream = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'stream-edit', params: { streamId } });

export const navigateToStreamSubscribers = (streamId: number): NavigateAction =>
  NavigationActions.navigate({ routeName: 'invite-users', params: { streamId } });

export const navigateToNotifications = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'notifications' });

export const navigateToLegal = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'legal' });

export const navigateToUserStatus = (): NavigateAction =>
  NavigationActions.navigate({ routeName: 'user-status' });
