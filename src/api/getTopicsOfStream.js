import { apiGet } from './apiFetch';

export default async (
  auth,
  streamId
) =>
  apiGet(
    auth,
    `users/me/${streamId}/topics`,
    {},
    res => res.messages
  );
