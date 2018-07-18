/* @flow */
import type { ApiServerSettings } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (realm: string): Promise<ApiServerSettings> =>
  apiGet({ apiKey: '', email: '', realm }, 'server_settings');
