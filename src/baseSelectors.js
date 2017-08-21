/* @flow */
import type { GlobalState, Narrow, Message, Subscription, Stream, Presence, Outbox } from './types';

export const getMute = (state: GlobalState): Object => state.mute;

export const getTyping = (state: GlobalState): Object => state.typing;

export const getUsers = (state: GlobalState): Object => state.users;

export const getFlags = (state: GlobalState): Object => state.flags;

export const getReadFlags = (state: GlobalState): Object => state.flags.read;

export const getAllMessages = (state: GlobalState): Message[] => state.chat.messages;

export const getActiveNarrow = (state: GlobalState): Narrow => state.chat.narrow;

export const getSubscriptions = (state: GlobalState): Subscription[] => state.subscriptions;

export const getStreams = (state: GlobalState): Stream[] => state.streams;

export const getPresence = (state: GlobalState): Presence[] => state.presence;

export const getOutbox = (state: GlobalState): Outbox[] => state.outbox;

export const getActiveNarrowString = (state: GlobalState): string =>
  JSON.stringify(state.chat.narrow);

export const getUnreadStreams = (state: GlobalState): Object[] => state.unread.streams;

export const getUnreadPms = (state: GlobalState): Object[] => state.unread.pms;

export const getUnreadHuddles = (state: GlobalState): Object[] => state.unread.huddles;

export const getUnreadMentions = (state: GlobalState): number[] => state.unread.mentions;
