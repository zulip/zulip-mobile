/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account): Promise<ApiResponse> => apiPost(auth, 'user_groups/create');
