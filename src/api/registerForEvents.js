import { apiPost, Auth } from './apiFetch';

export default (auth: Auth) =>
  apiPost(
    auth,
    'register',
    {
      apply_markdown: true,
      event_types: JSON.stringify([
        'message',
        'update_message',
        'subscription',
        'reaction',
        'presence',
        'update_message_flags',
      ]),
    },
  );
