/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { type FetchedMessage } from '../rawModelTypes';
import { apiGet } from '../apiFetch';

// The actual response from a (current) server.  We convert the message to a
// proper Message before looking at its contents.
type ServerApiResponseSingleMessage = {|
  ...$Exact<ApiResponseSuccess>,
  -raw_content: string, // deprecated

  // Until we narrow FetchedMessage into its FL 120+ form, FetchedMessage
  // will be a bit less precise than we could be here. That's because we
  // only get this field from servers FL 120+.
  +message: FetchedMessage,
|};

// The response from a pre-FL 120 server.
type ResponsePre120 = {|
  ...$Exact<ApiResponseSuccess>,
  +raw_content: string, // deprecated
|};

/**
 * A wrapper for https://zulip.com/api/get-message that just gives a
 *   message's raw Markdown content.
 *
 * See also api.getSingleMessage to get a whole Message object.
 *
 * Uses `.message.content` in the response when available, i.e., from
 * servers with FL 120+. Otherwise uses the top-level `.raw_content`.
 */
// TODO(server-5.0): Simplify FL-120 condition in jsdoc and implementation.
export default async (
  auth: Auth,
  args: {|
    +message_id: number,
  |},

  // TODO(#4659): Don't get this from callers.
  zulipFeatureLevel: number,
): Promise<string> => {
  const { message_id } = args;

  if (zulipFeatureLevel >= 120) {
    const response: ServerApiResponseSingleMessage = await apiGet(auth, `messages/${message_id}`, {
      apply_markdown: false,
    });
    return response.message.content;
  } else {
    const response: ResponsePre120 = await apiGet(auth, `messages/${message_id}`);
    return response.raw_content;
  }
};
