/* @flow strict-local */
import type { Auth } from './transportTypes';
import messagesFlags from './messages/messagesFlags';

const TIME_INTERVAL_BETWEEN_CONSECUTIVE_CALLS_MS = 2000;
let unsentMessageIds = [];
let lastSentTime = 0;
let timeout = null;

/**
 * Exported so that it can be used in test
 * See queueMarkAsRead-test.js
 */
export const resetAll = () => {
  unsentMessageIds = [];
  lastSentTime = 0;
  timeout = null;
};

const processQueue = (auth: Auth) => {
  if (Date.now() - lastSentTime > TIME_INTERVAL_BETWEEN_CONSECUTIVE_CALLS_MS) {
    messagesFlags(auth, unsentMessageIds, 'add', 'read');
    unsentMessageIds = [];
    lastSentTime = Date.now();
  } else if (timeout === null) {
    timeout = setTimeout(() => {
      timeout = null;
      processQueue(auth);
    }, TIME_INTERVAL_BETWEEN_CONSECUTIVE_CALLS_MS);
  }
};

export default (auth: Auth, messageIds: number[]): void => {
  unsentMessageIds.push(...messageIds);
  processQueue(auth);
};
