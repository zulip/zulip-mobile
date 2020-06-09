/* @flow strict-local */
import type { Auth } from './apiTypes';
import getFileTemporaryUrl from './messages/getFileTemporaryUrl';
import { getFullUrl } from '../utils/url';

/**
 * Get the complete authless URL to a realm uploaded file, returns null if that
 * fails.
 *
 * See aslo jsdoc on getFileTemporaryUrl.
 *
 * @param href URL path to the resource.
 * @param auth Current user's auth information.
 */
export default async (href: string, auth: Auth): Promise<string | null> => {
  try {
    return getFullUrl((await getFileTemporaryUrl(auth, href)).url, auth.realm);
  } catch (err) {
    return null;
  }
};
