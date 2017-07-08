/* @flow */
import type { Action } from '../types';
import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../actionConstants';

export const startTyping = (): Action => ({
  type: EVENT_TYPING_START,
});

export const stopTyping = (): Action => ({
  type: EVENT_TYPING_STOP,
});
