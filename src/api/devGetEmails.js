/* @flow */
import type { Auth } from '../types';
import { apiGet } from './apiFetch';

export default (auth: Auth): Promise<[string[], string[]]> =>
  apiGet(auth, 'dev_get_emails', res => [res.direct_admins, res.direct_users]);
