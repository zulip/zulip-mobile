/* @flow */
import type { Auth } from '../../types';
import { apiGet } from '../apiFetch';

export default (auth: Auth, id: number): any => apiGet(auth, `realm/user_groups/${id}`, res => res);
