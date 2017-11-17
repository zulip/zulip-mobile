import { apiPatch } from '../apiFetch';

export default async (auth, id) =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content: '',
  });
