/* @flow strict-local */
import type { Auth, Stream } from '../apiTypes';
import { apiGet } from '../apiFetch';

/** See https://zulipchat.com/api/get-all-streams */
export default async (auth: Auth): Promise<Stream[]> => apiGet(auth, 'streams', res => res.streams);
