/* @flow */
import type { Auth } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth, messageId: number) =>
  apiGet(auth, `messages/${messageId}`, res => res.raw_content);
