/* @flow */
import type { Auth } from '../types';
import messagesFlags from './messages/messagesFlags';

export default (auth: Auth, messageIds: number[], starMessage: boolean): any => {
  messagesFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
};
