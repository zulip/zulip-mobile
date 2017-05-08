/* @flow */
import { Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth) =>
  apiPost(
    auth,
    'register',
    res => res,
    {
      apply_markdown: true,
      event_types: JSON.stringify([
        'message',
        'muted_topics',
        'presence',
        'reaction',
        'realm_user',
        'stream',
        'subscription',
        'typing',
        'update_message',
        'update_message_flags',
      ]),
      fetch_event_types: JSON.stringify([
        'muted_topics',
      ]),
    },
);
