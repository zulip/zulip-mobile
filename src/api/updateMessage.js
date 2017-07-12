import { apiPatch } from './apiFetch';

export default async (auth, content, id) =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content,
  });
