/* @flow */
import type { Auth, Stream } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<Stream[]> => apiGet(auth, 'streams', res => res.streams);
