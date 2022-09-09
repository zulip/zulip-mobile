/* @flow strict-local */
import type { Auth } from './apiTypes';
import getFileTemporaryUrl from './messages/getFileTemporaryUrl';

/**
 * Like getFileTemporaryUrl, but on error returns null instead of throwing.
 */
export default async (href: string, auth: Auth): Promise<URL | null> => {
  try {
    return await getFileTemporaryUrl(auth, href);
  } catch {
    return null;
  }
};
