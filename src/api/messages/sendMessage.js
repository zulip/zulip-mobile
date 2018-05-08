/* eslint-disable camelcase */
/* @flow */

import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (
  auth: Auth,
  type: 'private' | 'stream',
  to: string | string[],
  subject: string,
  content: string,
  localId: number,
  eventQueueId: number,
) =>
  apiPost(auth, 'messages', res => res, {
    type,
    to,
    subject,
    content,
    local_id: localId,
    queue_id: eventQueueId,
  });
