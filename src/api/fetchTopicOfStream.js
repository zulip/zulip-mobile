/* @flow */
import type { Auth } from '../types';
import { apiGet } from './apiFetch';

export default async (auth: Auth, streamId: number) =>
  apiGet(auth, `users/me/${streamId}/topics`, res => res.topics);
