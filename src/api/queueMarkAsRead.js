/* @flow strict-local */
import type { Auth } from './transportTypes';
import messagesFlags from './messages/messagesFlags';

/** We batch up requests to avoid sending them twice in this much time. */
const debouncePeriodMs = 2000;

let unsentMessageIds = [];
let lastSentTime = -Infinity;
let timeout = null;

/** Private; exported only for tests. */
export const resetAll = () => {
  unsentMessageIds = [];
  lastSentTime = -Infinity;
  timeout = null;
};

const processQueue = (auth: Auth) => {
  if (timeout !== null) {
    return;
  }

  const remainingMs = lastSentTime + debouncePeriodMs - Date.now();
  if (remainingMs > 0) {
    timeout = setTimeout(() => {
      timeout = null;
      processQueue(auth);
    }, remainingMs);
    return;
  }

  messagesFlags(auth, unsentMessageIds, 'add', 'read');
  unsentMessageIds = [];
  lastSentTime = Date.now();
};

export default (auth: Auth, messageIds: number[]): void => {
  unsentMessageIds.push(...messageIds);
  processQueue(auth);
};
