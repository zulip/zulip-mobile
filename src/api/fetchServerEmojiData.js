/* @flow strict-local */
import { networkActivityStart, networkActivityStop } from '../utils/networkActivity';
import {
  MalformedResponseError,
  NetworkError,
  RequestError,
  Server5xxError,
  UnexpectedHttpStatusError,
} from './apiErrors';
import type { ServerEmojiData } from './modelTypes';
import { objectEntries } from '../flowPonyfill';
import userAgent from '../utils/userAgent';

/**
 * The unprocessed response from the server.
 *
 * Documented at `server_emoji_data_url` in
 *   https://zulip.com/api/register-queue.
 *
 * We make a ServerEmojiData out of this, and return that.
 */
type ServerEmojiDataRaw = {|
  +code_to_names: {|
    +[emoji_code: string]: $ReadOnlyArray<string>,
  |},
|};

function tryTransform(raw: ServerEmojiDataRaw): ServerEmojiData | void {
  try {
    return { code_to_names: new Map(objectEntries(raw.code_to_names)) };
  } catch {
    return undefined;
  }
}

/**
 * Fetch data from server_emoji_data_url, given in the /register response.
 *
 * See `server_emoji_data_url` in https://zulip.com/api/register-queue.
 *
 * Unauthenticated.
 *
 * Empirically, as of 2022-08, the HTTP headers are respected on both
 * platforms, and the caching works.
 *
 * Converts to a nicer shape, e.g., using JS Maps instead of objects-as-map.
 */
// Much of the implementation is similar to apiCall and
// interpretApiResponse. But it's tailored to this nontraditional endpoint,
// which doesn't conform to the usual Zulip API protocols, such as sending
//   { code, msg, result }
// in a 4xx response. If servers grow more endpoints like this one, it'd
// probably be good to refactor.
export default async (emojiDataUrl: URL): Promise<ServerEmojiData> => {
  let response = undefined;
  networkActivityStart(false);
  try {
    response = await fetch(emojiDataUrl, { method: 'get', headers: { 'User-Agent': userAgent } });
  } catch (errorIllTyped) {
    const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
    if (e instanceof TypeError) {
      // This really is how `fetch` is supposed to signal a network error:
      //   https://fetch.spec.whatwg.org/#ref-for-concept-network-error⑥⓪
      throw new NetworkError(e.message);
    }
    throw e;
  } finally {
    networkActivityStop(false);
  }

  const httpStatus = response.status;
  if (httpStatus >= 400 && httpStatus <= 499) {
    // Client error…?
    //
    // If 404, maybe we had the wrong idea of what URL to request (unlikely,
    // but would be a client error). Or maybe the server failed to get
    // provisioned with the JSON file at the promised URL (a server error).
    //
    // Don't bother trying to make an ApiError by parsing JSON for `code`,
    // `msg`, or `result`; this endpoint doesn't give them.
    throw new RequestError(httpStatus);
  } else if (httpStatus >= 500 && httpStatus <= 599) {
    throw new Server5xxError(httpStatus);
  } else if (httpStatus <= 199 || (httpStatus >= 300 && httpStatus <= 399) || httpStatus >= 600) {
    // Seems like a server error; the endpoint doesn't document sending
    // these statuses. No reason to think parsing JSON would give anything
    // useful; just say `data` is undefined.
    throw new UnexpectedHttpStatusError(httpStatus, undefined);
  }

  let json = undefined;
  try {
    json = (await response.json(): ServerEmojiDataRaw);
  } catch {
    throw new MalformedResponseError(httpStatus, undefined);
  }

  const transformed = tryTransform(json);
  if (!transformed) {
    throw new MalformedResponseError(httpStatus, json);
  }

  return transformed;
};
