/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

export default (auth: Auth, newAccountDetails: {| full_name: string |}): Promise<ApiResponse> =>
  apiPatch(auth, 'settings', { ...newAccountDetails });
