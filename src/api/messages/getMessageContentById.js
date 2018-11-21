/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (account: Account, messageId: number): Promise<string> =>
  apiGet(account, `messages/${messageId}`, res => res.raw_content);
