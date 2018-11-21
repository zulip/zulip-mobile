/* @flow */
import type { Account, Stream } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Account): Promise<Stream[]> =>
  apiGet(auth, 'streams', res => res.streams);
