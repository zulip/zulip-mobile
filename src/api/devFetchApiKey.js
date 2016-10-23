import { apiPost, Auth } from './apiFetch';

export default async (auth: Auth, email: string) =>
  apiPost(
    auth,
    'dev_fetch_api_key',
    { username: email },
    res => res.api_key,
  );
