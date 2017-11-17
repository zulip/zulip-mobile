/* @flow */
import type { Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default async (auth: Auth, id: number) => apiDelete(auth, `user_groups/${id}`, res => res);
