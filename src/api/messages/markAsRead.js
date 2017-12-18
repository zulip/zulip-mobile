/* @flow */
import type { Auth } from '../../types';
import messagesFlags from './messagesFlags';

export default (auth: Auth, messageIds: number[]): any =>
  messagesFlags(auth, messageIds, 'add', 'read');
