/* @flow */
import type { Account } from '../apiTypes';
import messagesFlags from './messagesFlags';

export default (auth: Account, messageIds: number[], starMessage: boolean): any => {
  messagesFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
};
