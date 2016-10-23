import { apiGet, Auth } from './apiFetch';

export type Backend = 'dev' | 'google' | 'password';

export default async (auth: Auth) =>
  apiGet(
    auth,
    'get_auth_backends',
    {},
    res => {
      const backends = [];
      if (res.result === 'success') {
        if (res.password) backends.push('password');
        if (res.google) backends.push('google');
        if (res.dev) backends.push('dev');
      }
      if (!backends) {
        throw new Error('No backends available.');
      }
      return backends;
    }
  );
