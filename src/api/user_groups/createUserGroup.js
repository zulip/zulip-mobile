/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (account: Account): Promise<ApiResponse> => apiPost(account, 'user_groups/create');
