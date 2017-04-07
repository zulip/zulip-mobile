import {apiPost, Auth} from './apiFetch';

export default (
  auth: Auth,
  messages: number[],
  op: string,
  flag: string
): number[] => apiPost(auth, 'upload_file', {}, res => res.uri);
