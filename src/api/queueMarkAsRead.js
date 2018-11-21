/* @flow */
import type { Account } from './apiTypes';
import messagesFlags from './messages/messagesFlags';

let unsentMessageIds = [];
let lastSentTime = 0;

export default (auth: Account, messageIds: number[]): any => {
  unsentMessageIds.push(...messageIds);

  if (Date.now() - lastSentTime > 2000) {
    messagesFlags(auth, unsentMessageIds, 'add', 'read');
    unsentMessageIds = [];
    lastSentTime = Date.now();
  }
};
