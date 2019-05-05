/* @flow strict-local */
import type { Action } from '../types';

export const clearTyping = (outdatedNotifications: string[]): Action => ({
  type: 'CLEAR_TYPING',
  outdatedNotifications,
});
