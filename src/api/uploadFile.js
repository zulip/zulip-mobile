/* @flow */
import type { Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth, messages: number[], op: string, flag: string): mixed =>
  apiPost(auth, 'upload_file', res => res.uri);
