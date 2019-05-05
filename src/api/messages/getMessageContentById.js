/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseMessageContent = {|
  ...ApiResponseSuccess,
  raw_content: string,
|};

export default async (auth: Auth, messageId: number): Promise<ApiResponseMessageContent> =>
  apiGet(auth, `messages/${messageId}`);
