/* @flow */
import { apiGet } from '../apiFetch';

export default async (realm: string) =>
  apiGet({ apiKey: '', email: '', realm }, 'server_settings', res => res);
