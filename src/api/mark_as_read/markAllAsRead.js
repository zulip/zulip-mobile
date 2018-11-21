/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account): Promise<ApiResponse> => apiPost(auth, 'mark_all_as_read');
