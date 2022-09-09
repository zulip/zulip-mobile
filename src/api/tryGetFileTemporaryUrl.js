/* @flow strict-local */
import type { Auth } from './apiTypes';
import { isUrlOnRealm, tryParseUrl } from '../utils/url';
import getFileTemporaryUrl from './messages/getFileTemporaryUrl';

/**
 * Like getFileTemporaryUrl, but on error returns null instead of throwing.
 *
 * Validates `href` to give getFileTemporaryUrl the kind of input it expects
 * and returns null if validation fails.
 */
export default async (href: string, auth: Auth): Promise<URL | null> => {
  // TODO: Have this function take this parsed form instead of raw string.
  const parsedUrl = tryParseUrl(href, auth.realm);
  if (!parsedUrl || !isUrlOnRealm(parsedUrl, auth.realm)) {
    return null;
  }

  // A "path-absolute-URL string".
  //
  // When the unparsed `href` is a relative URL (i.e., one meant for the
  // realm), we've seen it with and without a leading slash:
  //   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Interpreting.20links.20in.20messages/near/1410903
  //
  // With the slash, `href` is  a "path-absolute-URL string". Without the
  // slash, it's a "path-relative-URL string" meant as relative to the root
  // path /. By using the URL parser with the root path as a base
  // (auth.realm should point to the root path), we normalize away that
  // difference: `.pathname` on a URL object gives the path-absolute string
  // starting with a slash. We also drop any query and fragment that might
  // have been in `href`.
  //
  // Quoted terms come from the URL spec:
  //   https://url.spec.whatwg.org/#url-writing
  const { pathname } = parsedUrl;

  if (!/^\/user_uploads\/[0-9]+\/.+$/.test(pathname)) {
    return null;
  }

  try {
    return await getFileTemporaryUrl(
      auth,

      // This param wants a "'path-absolute-URL string' […] meant for the
      // realm, of the form `/user_uploads/{realm_id_str}/{filename}". See
      // above for how we ensure that.
      pathname,
    );
  } catch {
    return null;
  }
};
