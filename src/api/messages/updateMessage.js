/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, content: string, id: number) =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content,
  });
