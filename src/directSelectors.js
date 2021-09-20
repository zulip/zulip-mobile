/* @flow strict-local */
import type {
  PerAccountState,
  GlobalState,
  AccountsState,
  SubscriptionsState,
  StreamsState,
  OutboxState,
  UsersState,
  UserGroupsState,
  DraftsState,
  FetchingState,
  FlagsState,
  MessagesState,
  MuteState,
  MutedUsersState,
  NarrowsState,
  TopicsState,
  PresenceState,
  CrossRealmBot,
  RealmEmojiById,
  RealmState,
  PerAccountSettingsState,
  GlobalSettingsState,
  TypingState,
  Debug,
  VideoChatProvider,
  User,
  UserStatusState,
} from './types';
import type { SessionState } from './session/sessionReducer';

export const getAccounts = (state: GlobalState): AccountsState => state.accounts;

export const getSession = (state: GlobalState): SessionState => state.session;

export const getIsOnline = (state: GlobalState): boolean | null => state.session.isOnline;
export const getDebug = (state: GlobalState): Debug => state.session.debug;
export const getIsHydrated = (state: GlobalState): boolean => state.session.isHydrated;

export const getCanCreateStreams = (state: PerAccountState): boolean =>
  state.realm.canCreateStreams;

export const getDrafts = (state: PerAccountState): DraftsState => state.drafts;

export const getLoading = (state: PerAccountState): boolean => state.session.loading;

export const getMessages = (state: PerAccountState): MessagesState => state.messages;

export const getMute = (state: PerAccountState): MuteState => state.mute;

export const getMutedUsers = (state: PerAccountState): MutedUsersState => state.mutedUsers;

export const getTyping = (state: PerAccountState): TypingState => state.typing;

export const getTopics = (state: PerAccountState): TopicsState => state.topics;

export const getUserGroups = (state: PerAccountState): UserGroupsState => state.userGroups;

export const getUserStatus = (state: PerAccountState): UserStatusState => state.userStatus;

/**
 * WARNING: despite the name, only (a) `is_active` users (b) excluding cross-realm bots.
 *
 * See `getAllUsers`.
 */
export const getUsers = (state: PerAccountState): UsersState => state.users;

export const getFetching = (state: PerAccountState): FetchingState => state.fetching;

export const getFlags = (state: PerAccountState): FlagsState => state.flags;

export const getAllNarrows = (state: PerAccountState): NarrowsState => state.narrows;

export const getSettings = (state: PerAccountState): PerAccountSettingsState => state.settings;
export const getGlobalSettings = (state: GlobalState): GlobalSettingsState => state.settings;

export const getSubscriptions = (state: PerAccountState): SubscriptionsState => state.subscriptions;

/**
 * All streams in the current realm.
 *
 * This is rarely the right selector to use: consider `getStreamForId`
 * or `getStreamsById` instead.
 */
export const getStreams = (state: PerAccountState): StreamsState => state.streams;

export const getPresence = (state: PerAccountState): PresenceState => state.presence;

export const getOutbox = (state: PerAccountState): OutboxState => state.outbox;

export const getRealm = (state: PerAccountState): RealmState => state.realm;

export const getCrossRealmBots = (state: PerAccountState): $ReadOnlyArray<CrossRealmBot> =>
  state.realm.crossRealmBots;

export const getRawRealmEmoji = (state: PerAccountState): RealmEmojiById => state.realm.emoji;

export const getNonActiveUsers = (state: PerAccountState): $ReadOnlyArray<User> =>
  state.realm.nonActiveUsers;

export const getIsAdmin = (state: PerAccountState): boolean => state.realm.isAdmin;

export const getVideoChatProvider = (state: PerAccountState): VideoChatProvider | null =>
  state.realm.videoChatProvider;
