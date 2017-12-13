/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default (auth: Auth, id: number, property: string, value: string) =>
  apiPatch(auth, `streams/${id}`, res => res, {
    [property]: value,
  });
