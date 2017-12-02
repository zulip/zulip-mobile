/* @flow */
import type { Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, id: number) => apiDelete(auth, `streams/${id}`, res => res);
