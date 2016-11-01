import { apiPost, Auth } from './apiFetch';

export default (auth: Auth, email: string, password: string) =>
  apiPost(
    auth,
    'fetch_api_key',
    { username: email, password },
    res => res.api_key,
  );
