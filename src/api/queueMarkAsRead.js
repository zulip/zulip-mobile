/* @flow strict-local */
import type { Auth } from './transportTypes';
import updateMessageFlags from './messages/updateMessageFlags';

/** We batch up requests to avoid sending them twice in this much time. */
const debouncePeriodMs = 500;

const batchSize = 1000;

let unackedMessageIds: number[] = [];
let lastSentTime = -Infinity;
let timeout = null;

/** Private; exported only for tests. */
export const resetAll = () => {
  unackedMessageIds = [];
  lastSentTime = -Infinity;
  timeout = null;
};

const processQueue = async (auth: Auth) => {
  if (timeout !== null || unackedMessageIds.length === 0) {
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

  const toSend = unackedMessageIds.slice(0, batchSize);
  const response = await updateMessageFlags(auth, toSend, 'add', 'read');

  const acked = new Set(response.messages);
  unackedMessageIds = unackedMessageIds.filter(id => !acked.has(id));
};

export default (auth: Auth, messageIds: $ReadOnlyArray<number>): void => {
  unackedMessageIds.push(...messageIds);
  processQueue(auth);
};
