import { apiPost, Auth } from './apiFetch';

export default (auth: Auth) =>
  apiPost(
    auth,
    'register',
    {
      apply_markdown: true,
      event_types: JSON.stringify([
        'message',
        'muted_topics',
        'presence',
        'reaction',
        'realm_user',
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
