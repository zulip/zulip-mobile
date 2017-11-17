/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (auth: Auth) => apiPost(auth, 'user_groups/create', res => res);
