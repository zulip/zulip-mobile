/* @flow */
import type { Auth } from '../types';
import { apiGet } from './apiFetch';

export default (auth: Auth) =>
  apiGet(auth, 'get_auth_backends', res => {
    const backends = [];
    if (res.result === 'success') {
      if (res.password) backends.push('password');
      if (res.google) backends.push('google');
      if (res.github) backends.push('github');
      if (res.dev) backends.push('dev');
    }
    if (!backends) {
      throw new Error('No backends available.');
    }
    return backends;
  });
