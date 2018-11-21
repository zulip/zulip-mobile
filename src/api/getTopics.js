/* @flow */
import type { Account, Topic } from './apiTypes';
import { apiGet } from './apiFetch';

export default async (auth: Account, streamId: number): Promise<Topic[]> =>
  apiGet(auth, `users/me/${streamId}/topics`, res => res.topics);
