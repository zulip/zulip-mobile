import {apiGet, Auth} from './apiFetch';

export default (auth: Auth): any =>
  apiGet(auth, 'users', {}, res => res.members);
