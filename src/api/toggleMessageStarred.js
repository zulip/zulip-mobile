/* @flow */
import { Auth } from '../types';
import messagesFlags from './messagesFlags';

export default (auth: Auth, messageIds: number[], starMessage: boolean): any => {
  messagesFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
};
