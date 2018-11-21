/* @flow */
import type { Account } from './apiTypes';
import messagesFlags from './messages/messagesFlags';

let unsentMessageIds = [];
let lastSentTime = 0;

export default (account: Account, messageIds: number[]): any => {
  unsentMessageIds.push(...messageIds);

  if (Date.now() - lastSentTime > 2000) {
    messagesFlags(account, unsentMessageIds, 'add', 'read');
    unsentMessageIds = [];
    lastSentTime = Date.now();
  }
};
