/* @flow */
import type { Account, Topic } from './apiTypes';
import { apiGet } from './apiFetch';

export default async (account: Account, streamId: number): Promise<Topic[]> =>
  apiGet(account, `users/me/${streamId}/topics`, res => res.topics);
