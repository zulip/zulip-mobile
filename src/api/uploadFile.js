/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from './transportTypes';
import { apiFile } from './apiFetch';
import { getFileExtension, getMimeTypeFromFileExtension } from '../utils/url';

type ApiResponseUploadFile = {|
  ...$Exact<ApiResponseSuccess>,
  uri: string,
|};

export default (auth: Auth, uri: string, name: string): Promise<ApiResponseUploadFile> => {
  const formData = new FormData();
  const extension = getFileExtension(name);
  const type = getMimeTypeFromFileExtension(extension);
  // $FlowFixMe[incompatible-call]
  formData.append('file', { uri, name, type, extension });
  return apiFile(auth, 'user_uploads', formData);
};
