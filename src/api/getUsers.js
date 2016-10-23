import { apiGet, Auth } from './apiFetch';

export default async (auth: Auth): any =>
  apiGet(
    auth,
    'users',
    {},
    res => res.members,
  );
