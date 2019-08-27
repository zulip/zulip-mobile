/* @flow strict-local */
import type { Auth } from './transportTypes';
import messagesFlags from './messages/messagesFlags';

/** We batch up requests to avoid sending them twice in this much time. */
const debouncePeriodMs = 2000;

let unsentMessageIds = [];
let lastSentTime = 0;
let timeout = null;

/** Private; exported only for tests. */
export const resetAll = () => {
  unsentMessageIds = [];
  lastSentTime = 0;
  timeout = null;
};

const processQueue = (auth: Auth) => {
  const sinceSentMs = Date.now() - lastSentTime;
  if (sinceSentMs > debouncePeriodMs) {
    messagesFlags(auth, unsentMessageIds, 'add', 'read');
    unsentMessageIds = [];
    lastSentTime = Date.now();
  } else if (timeout === null) {
    timeout = setTimeout(() => {
      timeout = null;
      processQueue(auth);
    }, debouncePeriodMs - sinceSentMs);
  }
};

export default (auth: Auth, messageIds: number[]): void => {
  unsentMessageIds.push(...messageIds);
  processQueue(auth);
};
