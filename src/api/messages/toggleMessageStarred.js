/* @flow */
import type { Account } from '../apiTypes';
import messagesFlags from './messagesFlags';

export default (account: Account, messageIds: number[], starMessage: boolean): any => {
  messagesFlags(account, messageIds, starMessage ? 'add' : 'remove', 'starred');
};
