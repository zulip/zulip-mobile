/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default (auth: Auth, id: number, name: string, description: string, isPrivate: string) =>
  apiPatch(auth, `streams/${id}`, res => res, {
    new_name: name,
    description,
    is_private: isPrivate,
  });
