/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import messagesFlags from './messagesFlags';

export default (auth: Auth, messageIds: number[], starMessage: boolean): Promise<ApiResponse> =>
  messagesFlags(auth, messageIds, starMessage ? 'add' : 'remove', 'starred');
