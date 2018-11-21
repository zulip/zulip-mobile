/* @flow */
import type { Account } from './apiTypes';
import { apiFile } from './apiFetch';
import { getFileExtension, getMimeTypeFromFileExtension } from '../utils/url';

export default (auth: Account, uri: string, name: string) => {
  const formData = new FormData();
  const extension = getFileExtension(name);
  const type = getMimeTypeFromFileExtension(extension);
  // $FlowFixMe
  formData.append('file', { uri, name, type, extension });
  return apiFile(auth, 'user_uploads', res => res.uri, formData);
};
