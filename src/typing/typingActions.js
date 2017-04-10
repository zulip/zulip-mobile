import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../actionConstants';

export const startTyping = () => ({
  type: EVENT_TYPING_START,
});

export const stopTyping = () => ({
  type: EVENT_TYPING_STOP,
});
