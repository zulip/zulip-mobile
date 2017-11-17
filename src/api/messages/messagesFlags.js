/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default (auth: Auth, messages: number[], op: string, flag: string): any =>
  apiPost(auth, 'messages/flags', res => res, { messages: JSON.stringify(messages), flag, op });
