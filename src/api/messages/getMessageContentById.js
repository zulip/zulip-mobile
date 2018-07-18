/* @flow */
import type { Auth } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Auth, messageId: number): Promise<string> =>
  apiGet(auth, `messages/${messageId}`, res => res.raw_content);
