/* @flow */
import type { Auth, DevUser } from './apiTypes';
import { apiGet } from './apiFetch';

export default (auth: Auth): Promise<[DevUser[], DevUser[]]> =>
  apiGet(auth, 'dev_list_users', res => [res.direct_admins, res.direct_users]);
