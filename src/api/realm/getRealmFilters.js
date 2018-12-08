/* @flow strict-local */
import type { Auth, RealmFilter } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<RealmFilter[]> =>
  apiGet(auth, 'realm/filters', res => res.filters);
