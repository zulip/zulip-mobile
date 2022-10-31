/* @flow strict-local */
import type { Auth } from '../transportTypes';
import updateMessageFlags from './updateMessageFlags';
import type { ApiResponseUpdateMessageFlags } from './updateMessageFlags';

export default (
  auth: Auth,
  messageIds: $ReadOnlyArray<number>,
  starMessage: boolean,
): Promise<ApiResponseUpdateMessageFlags> =>
  updateMessageFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
