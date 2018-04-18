/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, id: number) =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content: '',
  });
