/* @flow strict-local */
import type {
  GlobalState,
  DraftsState,
  FetchingState,
  FlagsState,
  MessagesState,
  MuteState,
  NarrowsState,
  TopicsState,
  PresenceState,
  CrossRealmBot,
  RealmEmojiById,
  RealmState,
  SettingsState,
  TypingState,
  Account,
  Debug,
  Subscription,
  VideoChatProvider,
  Stream,
  Outbox,
  User,
  UserGroup,
  UserStatusState,
} from './types';
import type { SessionState } from './session/sessionReducer';

export const getAccounts = (state: GlobalState): Account[] => state.accounts;

export const getSession = (state: GlobalState): SessionState => state.session;

export const getIsOnline = (state: GlobalState): boolean => state.session.isOnline;
export const getDebug = (state: GlobalState): Debug => state.session.debug;
export const getIsHydrated = (state: GlobalState): boolean => state.session.isHydrated;

export const getCanCreateStreams = (state: GlobalState): boolean => state.realm.canCreateStreams;

export const getDrafts = (state: GlobalState): DraftsState => state.drafts;

export const getLoading = (state: GlobalState): boolean => state.session.loading;

export const getMessages = (state: GlobalState): MessagesState => state.messages;

export const getMute = (state: GlobalState): MuteState => state.mute;

export const getTyping = (state: GlobalState): TypingState => state.typing;

export const getTopics = (state: GlobalState): TopicsState => state.topics;

export const getUserGroups = (state: GlobalState): UserGroup[] => state.userGroups;

export const getUserStatus = (state: GlobalState): UserStatusState => state.userStatus;

/**
 * WARNING: despite the name, only (a) `is_active` users (b) excluding cross-realm bots.
 *
 * See `getAllUsers`.
 */
export const getUsers = (state: GlobalState): User[] => state.users;

export const getFetching = (state: GlobalState): FetchingState => state.fetching;

export const getFlags = (state: GlobalState): FlagsState => state.flags;

export const getReadFlags = (state: GlobalState): { [messageId: number]: boolean } =>
  state.flags.read;

export const getAllNarrows = (state: GlobalState): NarrowsState => state.narrows;

export const getSettings = (state: GlobalState): SettingsState => state.settings;

export const getSubscriptions = (state: GlobalState): Subscription[] => state.subscriptions;

/**
 * All streams in the current realm.
 *
 * This is rarely the right selector to use: consider `getStreamForId`
 * or `getStreamsById` instead.
 */
export const getStreams = (state: GlobalState): Stream[] => state.streams;

export const getPresence = (state: GlobalState): PresenceState => state.presence;

export const getOutbox = (state: GlobalState): Outbox[] => state.outbox;

export const getRealm = (state: GlobalState): RealmState => state.realm;

export const getCrossRealmBots = (state: GlobalState): CrossRealmBot[] =>
  state.realm.crossRealmBots;

export const getRawRealmEmoji = (state: GlobalState): RealmEmojiById => state.realm.emoji;

export const getNonActiveUsers = (state: GlobalState): User[] => state.realm.nonActiveUsers;

export const getIsAdmin = (state: GlobalState): boolean => state.realm.isAdmin;

export const getVideoChatProvider = (state: GlobalState): VideoChatProvider | null =>
  state.realm.videoChatProvider;
