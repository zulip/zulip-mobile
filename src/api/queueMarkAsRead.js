/* @flow */
import type { Auth } from '../types';
import messagesFlags from './messagesFlags';

let unsentMessageIds = [];
let lastSentTime = 0;

export default (auth: Auth, messageIds: number[]): any => {
  unsentMessageIds.push(...messageIds);

  if (Date.now() - lastSentTime > 2000) {
    messagesFlags(auth, unsentMessageIds, 'add', 'read');
    unsentMessageIds = [];
    lastSentTime = Date.now();
  }
};
