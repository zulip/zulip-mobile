/* @flow */
import type {
  AppState,
  FlagsState,
  MessageState,
  TopicsState,
  GlobalState,
  Narrow,
  Subscription,
  Stream,
  Outbox,
  User,
} from './types';

export const getApp = (state: GlobalState): AppState => state.app;

export const getDrafts = (state: GlobalState): Object => state.drafts;

export const getMute = (state: GlobalState): Object => state.mute;

export const getTyping = (state: GlobalState): Object => state.typing;

export const getTopics = (state: GlobalState): TopicsState => state.topics;

export const getUsers = (state: GlobalState): User[] => state.users;

export const getFetching = (state: GlobalState): Object => state.fetching;

export const getFlags = (state: GlobalState): FlagsState => state.flags;

export const getReadFlags = (state: GlobalState): Object => state.flags.read;

export const getAllMessages = (state: GlobalState): MessageState => state.chat.messages;

export const getActiveNarrow = (state: GlobalState): Narrow => state.chat.narrow;

export const getSubscriptions = (state: GlobalState): Subscription[] => state.subscriptions;

export const getStreams = (state: GlobalState): Stream[] => state.streams;

export const getPresence = (state: GlobalState): Object => state.presence;

export const getOutbox = (state: GlobalState): Outbox[] => state.outbox;

export const getActiveNarrowString = (state: GlobalState): string =>
  JSON.stringify(state.chat.narrow);

export const getUnreadStreams = (state: GlobalState): Object[] => state.unread.streams;

export const getUnreadPms = (state: GlobalState): Object[] => state.unread.pms;

export const getUnreadHuddles = (state: GlobalState): Object[] => state.unread.huddles;

export const getUnreadMentions = (state: GlobalState): number[] => state.unread.mentions;
