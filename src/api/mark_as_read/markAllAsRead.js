/* @flow */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth): Promise<ApiResponse> => apiPost(auth, 'mark_all_as_read');
