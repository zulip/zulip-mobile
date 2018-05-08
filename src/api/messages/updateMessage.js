/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';
import { removeEmptyValues } from '../../utils/misc';

export default async (auth: Auth, content: Object, id: number) =>
  apiPatch(auth, `messages/${id}`, res => res, removeEmptyValues(content));
