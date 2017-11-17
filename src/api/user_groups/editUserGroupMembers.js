/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, id: number) =>
  apiPost(auth, `user_groups/${id}/members`, res => res);
