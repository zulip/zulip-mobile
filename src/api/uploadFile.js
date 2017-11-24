/* @flow */
import type { Auth } from '../types';
import { apiFile } from './apiFetch';
import { getFileExtension, getMimeTypeFromFileExtension } from '../utils/url';

export default (auth: Auth, uri: string, name: string) => {
  const formData = new FormData();
  const type = getMimeTypeFromFileExtension(getFileExtension(name));
  // $FlowFixMe
  formData.append('file', { uri, name, type });
  return apiFile(auth, 'user_uploads', res => res.uri, formData);
};
