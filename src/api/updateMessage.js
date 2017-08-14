import { apiPatch } from './apiFetch';

export default async (auth, content, id, errorFunc) =>
  apiPatch(auth, `messages/${id}`, res => res, errorFunc, {
    content,
  });
