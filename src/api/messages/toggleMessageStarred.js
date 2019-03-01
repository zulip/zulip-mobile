/* @flow strict-local */
import type { Auth } from '../transportTypes';
import messagesFlags from './messagesFlags';

export default (auth: Auth, messageIds: number[], starMessage: boolean): void => {
  messagesFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
};
