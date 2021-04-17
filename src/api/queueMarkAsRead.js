/* @flow strict-local */
import type { Auth } from './transportTypes';
import messagesFlags from './messages/messagesFlags';

/** We batch up requests to avoid sending them twice in this much time. */
const debouncePeriodMs = 2000;

let unackedMessageIds = [];
let lastSentTime = -Infinity;
let timeout = null;

/** Private; exported only for tests. */
export const resetAll = () => {
  unackedMessageIds = [];
  lastSentTime = -Infinity;
  timeout = null;
};

const processQueue = async (auth: Auth) => {
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

  lastSentTime = Date.now();
  const response = await messagesFlags(auth, unackedMessageIds, 'add', 'read');
  unackedMessageIds = unackedMessageIds.filter(id => !response.messages.includes(id));
};

export default (auth: Auth, messageIds: number[]): void => {
  unackedMessageIds.push(...messageIds);
  processQueue(auth);
};
