/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Account, messageId: number): Promise<string> =>
  apiGet(auth, `messages/${messageId}`, res => res.raw_content);
