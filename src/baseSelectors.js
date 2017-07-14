/* @flow */
import type { GlobalState, Narrow, Message, Stream } from './types';

export const getMute = (state: GlobalState): Object => state.mute;

export const getTyping = (state: GlobalState): Object => state.typing;

export const getUsers = (state: GlobalState): Object => state.users;

export const getReadFlags = (state: GlobalState): Object => state.flags.read;

export const getAllMessages = (state: GlobalState): Message[] => state.chat.messages;

export const getActiveNarrow = (state: GlobalState): Narrow => state.chat.narrow;

export const getSubscriptions = (state: GlobalState): Stream[] => state.subscriptions;
