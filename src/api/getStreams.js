import { apiGet } from './apiFetch';

export default async (auth) =>
  apiGet(
    auth,
    'streams',
    {},
    res => res.streams,
  );
