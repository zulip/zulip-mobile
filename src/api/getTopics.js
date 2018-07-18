/* @flow */
import type { Auth, Topic } from './apiTypes';
import { apiGet } from './apiFetch';

export default async (auth: Auth, streamId: number): Promise<Topic[]> =>
  apiGet(auth, `users/me/${streamId}/topics`, res => res.topics);
