/* @flow strict-local */
import type { Auth } from '../transportTypes';
import messagesFlags from './messagesFlags';
import type { ApiResponseMessagesFlags } from './messagesFlags';

export default (
  auth: Auth,
  messageIds: $ReadOnlyArray<number>,
  starMessage: boolean,
): Promise<ApiResponseMessagesFlags> =>
  messagesFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
