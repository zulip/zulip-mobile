/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.readthedocs.io/en/latest/subsystems/widgets.html#poll-todo-lists-and-games */
// `msg_type` only exists as widget at the moment, see #3205.
export default async (auth: Auth, messageId: number, content: string): Promise<ApiResponse> =>
  apiPost(auth, 'submessage', {
    message_id: messageId,
    msg_type: 'widget',
    content,
  });
