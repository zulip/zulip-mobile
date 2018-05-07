/* @flow */
import type { ApiResponse, Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth, recipients: string, operation: string): Promise<ApiResponse> =>
  apiPost(auth, 'typing', res => res, {
    to: recipients,
    op: operation,
  });
