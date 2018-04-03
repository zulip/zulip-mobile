/* @flow */
import type { ClearTypingAction } from '../types';

export const clearTyping = (outdatedNotifications: string[]): ClearTypingAction => ({
  type: 'CLEAR_TYPING',
  outdatedNotifications,
});
