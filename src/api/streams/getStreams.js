/* @flow */
import type { Account, Stream } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (account: Account): Promise<Stream[]> =>
  apiGet(account, 'streams', res => res.streams);
