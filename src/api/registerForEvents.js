import { apiPost, Auth } from './apiFetch';

export default async (auth: Auth) =>
  await apiPost(auth, 'register');
