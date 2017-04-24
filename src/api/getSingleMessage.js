import { apiGet } from './apiFetch';

export default async (
  auth,
  messageId,
) =>
  apiGet(
    auth,
    `messages/${messageId}`,
    {},
    res => res,
  );
