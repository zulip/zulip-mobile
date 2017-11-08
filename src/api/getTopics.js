/* @flow */
import type { Auth, TopicDetails } from '../types';
import { apiGet } from './apiFetch';

export default async (auth: Auth, streamId: number): Promise<TopicDetails[]> =>
  apiGet(auth, `users/me/${streamId}/topics`, res => res.topics);
