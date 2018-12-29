/* @flow strict-local */
import type {
  GlobalState,
  SessionState,
  DraftState,
  EmojiNameToCodePoint,
  FetchingState,
  FlagsState,
  LoadingState,
  MessagesState,
  MuteState,
  NarrowsState,
  TopicsState,
  PresenceState,
  RealmBot,
  RealmEmojiState,
  RealmState,
  SettingsState,
  StreamUnreadItem,
  TypingState,
  UnreadHuddlesState,
  UnreadMentionsState,
  UnreadPmsState,
  Account,
  Debug,
  Subscription,
  Stream,
  Outbox,
  User,
  UserGroup,
} from './types';

export const getAccounts = (state: GlobalState): Account[] => state.accounts;

export const getSession = (state: GlobalState): SessionState => state.session;

export const getIsActive = (state: GlobalState): boolean => state.session.isActive;
export const getIsOnline = (state: GlobalState): boolean => state.session.isOnline;
export const getDebug = (state: GlobalState): Debug => state.session.debug;
export const getIsHydrated = (state: GlobalState): boolean => state.session.isHydrated;

export const getCanCreateStreams = (state: GlobalState): boolean => state.realm.canCreateStreams;

export const getDrafts = (state: GlobalState): DraftState => state.drafts;

export const getLoading = (state: GlobalState): LoadingState => state.loading;

export const getMessages = (state: GlobalState): MessagesState => state.messages;

export const getMute = (state: GlobalState): MuteState => state.mute;

export const getTyping = (state: GlobalState): TypingState => state.typing;

export const getTopics = (state: GlobalState): TopicsState => state.topics;

export const getUserGroups = (state: GlobalState): UserGroup[] => state.userGroups;

export const getUsers = (state: GlobalState): User[] => state.users;

export const getFetching = (state: GlobalState): FetchingState => state.fetching;

export const getFlags = (state: GlobalState): FlagsState => state.flags;

export const getReadFlags = (state: GlobalState): { [messageId: number]: boolean } =>
  state.flags.read;

export const getAllNarrows = (state: GlobalState): NarrowsState => state.narrows;

export const getSettings = (state: GlobalState): SettingsState => state.settings;

export const getSubscriptions = (state: GlobalState): Subscription[] => state.subscriptions;

export const getStreams = (state: GlobalState): Stream[] => state.streams;

export const getPresence = (state: GlobalState): PresenceState => state.presence;

export const getOutbox = (state: GlobalState): Outbox[] => state.outbox;

export const getUnreadStreams = (state: GlobalState): StreamUnreadItem[] => state.unread.streams;

export const getUnreadPms = (state: GlobalState): UnreadPmsState => state.unread.pms;

export const getUnreadHuddles = (state: GlobalState): UnreadHuddlesState => state.unread.huddles;

export const getUnreadMentions = (state: GlobalState): UnreadMentionsState => state.unread.mentions;

export const getRealm = (state: GlobalState): RealmState => state.realm;

export const getCrossRealmBots = (state: GlobalState): RealmBot[] => state.realm.crossRealmBots;

export const getRawRealmEmoji = (state: GlobalState): RealmEmojiState => state.realm.emoji;

export const getNonActiveUsers = (state: GlobalState): User[] => state.realm.nonActiveUsers;

export const getIsAdmin = (state: GlobalState): boolean => state.realm.isAdmin;

export const getCodePointMap = (state: GlobalState): EmojiNameToCodePoint =>
  state.realm.unicodeCodeByName;
