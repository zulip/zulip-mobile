/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseMessageContent = {|
  ...$Exact<ApiResponseSuccess>,
  raw_content: string,
|};

/** See https://zulip.com/api/get-raw-message */
export default async (auth: Auth, messageId: number): Promise<ApiResponseMessageContent> =>
  apiGet(auth, `messages/${messageId}`);
