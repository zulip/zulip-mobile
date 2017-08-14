/* @flow */
import type { Auth } from '../types';
import { apiPatch } from './apiFetch';

export default async (auth: Auth, content: string, id: number, errorFunc: (msg: string) => void) =>
  apiPatch(auth, `messages/${id}`, res => res, errorFunc, {
    content,
  });
