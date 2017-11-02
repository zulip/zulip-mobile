/* @flow */
import type { Auth } from '../types';
import { apiFile } from './apiFetch';

export default (auth: Auth, uri: string, name: string, type: string = 'image/jpeg') => {
  const formData = new FormData();
  // $FlowFixMe
  formData.append('file', { uri, name, type });

  return apiFile(auth, 'user_uploads', res => res.uri, formData);
};
