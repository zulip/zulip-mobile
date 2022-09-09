/* @flow strict-local */
import type { Auth } from './apiTypes';
import { tryParseUrl } from '../utils/url';
import getFileTemporaryUrl from './messages/getFileTemporaryUrl';

/**
 * Like getFileTemporaryUrl, but on error returns null instead of throwing.
 *
 * Validates that `href` parses to a URL object with auth.realm.
 */
export default async (href: string, auth: Auth): Promise<URL | null> => {
  // TODO: Have this function take this parsed form instead of raw string.
  const parsedUrl = tryParseUrl(href, auth.realm);
  if (!parsedUrl) {
    return null;
  }
  // TODO: Stop using unparsed `href` below this point.

  try {
    return await getFileTemporaryUrl(auth, href);
  } catch {
    return null;
  }
};
