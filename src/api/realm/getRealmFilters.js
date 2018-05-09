/* @flow */
import type { Auth, RealmFilter } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<RealmFilter[]> =>
  apiGet(auth, 'realm/filters', res => res.filters);
