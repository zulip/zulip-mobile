import { apiPatch, Auth } from '../api/apiFetch';

export default async (auth: Auth, stream: string, topic: string) =>
  apiPatch(
    auth,
    'users/me/subscriptions/muted_topics',
    {
      stream,
      topic,
      op: 'add'
    },
    res => res
  );
