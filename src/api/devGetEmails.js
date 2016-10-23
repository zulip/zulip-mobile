import { apiGet, Auth } from './apiFetch';

export default async (auth: Auth) =>
  apiGet(
    auth,
    'dev_get_emails',
    {},
    res => [res.direct_admins, res.direct_users],
  );
