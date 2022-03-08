// @flow strict-local

import type {
  AlertWordsState,
  Auth,
  Debug,
  FlagsState,
  GlobalSettingsState,
  ImageEmojiType,
  MuteState,
  MutedUsersState,
  PerAccountState,
  Subscription,
  Stream,
  ThemeName,
  UserId,
  User,
  UserOrBot,
} from '../types';
import type { UnreadState } from '../unread/unreadModelTypes';
import {
  getAuth,
  getAllImageEmojiById,
  getFlags,
  getAllUsersById,
  getMutedUsers,
  getOwnUser,
  getSettings,
  getSubscriptionsById,
  getStreamsById,
  getRealm,
  getZulipFeatureLevel,
} from '../selectors';
import { getMute } from '../mute/muteModel';
import { getUnread } from '../unread/unreadModel';
import { getUserStatuses } from '../user-statuses/userStatusesModel';
import { type UserStatusesState } from '../user-statuses/userStatusesCore';

/**
 * Data about the user, the realm, and all known messages.
 *
 * This data is all independent of the specific narrow or specific messages
 * we're displaying; data about those goes elsewhere.
 *
 * We pass this object down to a variety of lower layers and helper
 * functions, where it saves us from individually wiring through all the
 * overlapping subsets of this data they respectively need.
 */
export type BackgroundData = $ReadOnly<{|
  alertWords: AlertWordsState,
  allImageEmojiById: $ReadOnly<{| [id: string]: ImageEmojiType |}>,
  auth: Auth,
  debug: Debug,
  flags: FlagsState,
  mute: MuteState,
  allUsersById: Map<UserId, UserOrBot>,
  mutedUsers: MutedUsersState,
  ownUser: User,
  streams: Map<number, Stream>,
  subscriptions: Map<number, Subscription>,
  unread: UnreadState,
  theme: ThemeName,
  twentyFourHourTime: boolean,
  userSettingStreamNotification: boolean,
  userStatuses: UserStatusesState,
  zulipFeatureLevel: number,
|}>;

// TODO: Ideally this ought to be a caching selector that doesn't change
//   when the inputs don't.  Doesn't matter in a practical way as used in
//   MessageList, because we have a `shouldComponentUpdate` that doesn't
//   look at this prop... but it'd be better to set an example of the right
//   general pattern.
export const getBackgroundData = (
  state: PerAccountState,
  globalSettings: GlobalSettingsState,
  debug: Debug,
): BackgroundData => ({
  alertWords: state.alertWords,
  allImageEmojiById: getAllImageEmojiById(state),
  auth: getAuth(state),
  debug,
  flags: getFlags(state),
  mute: getMute(state),
  allUsersById: getAllUsersById(state),
  mutedUsers: getMutedUsers(state),
  ownUser: getOwnUser(state),
  streams: getStreamsById(state),
  subscriptions: getSubscriptionsById(state),
  unread: getUnread(state),
  theme: globalSettings.theme,
  twentyFourHourTime: getRealm(state).twentyFourHourTime,
  userSettingStreamNotification: getSettings(state).streamNotification,
  userStatuses: getUserStatuses(state),
  zulipFeatureLevel: getZulipFeatureLevel(state),
});
