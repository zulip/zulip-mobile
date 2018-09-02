/* @flow strict-local */
import type { ApiServerSettings } from '../apiTypes';
import { apiGet } from '../apiFetch';

/** See https://zulipchat.com/api/server-settings */
export default async (realm: string): Promise<ApiServerSettings> =>
  apiGet({ apiKey: '', email: '', realm }, 'server_settings');
