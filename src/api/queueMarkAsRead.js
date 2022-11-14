/* @flow strict-local */
import type { Auth } from './transportTypes';
import updateMessageFlags from './messages/updateMessageFlags';

/** We batch up requests to avoid sending them twice in this much time. */
const debouncePeriodMs = 500;

const batchSize = 1000;

let unsentMessageIds: number[] = [];
let lastSentTime = -Infinity;
let timeout = null;

/** Private; exported only for tests. */
export const resetAll = () => {
  unsentMessageIds = [];
  lastSentTime = -Infinity;
  timeout = null;
};

const processQueue = async (auth: Auth) => {
  if (timeout !== null || unsentMessageIds.length === 0) {
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

  const toSend = unsentMessageIds.slice(0, batchSize);
  await updateMessageFlags(auth, toSend, 'add', 'read');

  const sent = new Set(toSend);
  unsentMessageIds = unsentMessageIds.filter(id => !sent.has(id));
};

export default (auth: Auth, messageIds: $ReadOnlyArray<number>): void => {
  unsentMessageIds.push(...messageIds);
  processQueue(auth);
};
