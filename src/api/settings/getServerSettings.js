/* @flow */
import type { Auth } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth) => apiGet(auth, 'server_settings', res => res);
