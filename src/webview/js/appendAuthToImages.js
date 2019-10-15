/* @flow strict-local */

import type { Auth } from '../../types';

/**
 * Rewrite the source URLs of relevant <img> tags beneath the specified parent
 * element to include the `api_key`.
 *
 * DEPRECATED: If no parent element is specified, we transform every <img> in
 * the entire document.
 */
export default (auth: Auth, element: Element | Document = document) => {
  // Extract all image tags including and/or beneath `element`.
  const imageTags: $ReadOnlyArray<HTMLImageElement> = [].concat(
    element instanceof HTMLImageElement ? [element] : [],
    Array.from(element.getElementsByTagName('img')),
  );

  imageTags.forEach(img => {
    if (!img.src.startsWith(auth.realm)) {
      return;
    }

    // This unusual form of authentication is only accepted by the server
    // for a small number of routes.  Rather than append the API key to all
    // kinds of URLs on the server, do so only for those routes.
    const srcPath = img.src.substring(auth.realm.length);
    if (
      !(
        srcPath.startsWith('/user_uploads/')
        || srcPath.startsWith('/thumbnail?')
        || srcPath.startsWith('/avatar/')
      )
    ) {
      return;
    }

    const delimiter = img.src.includes('?') ? '&' : '?';
    img.src += `${delimiter}api_key=${auth.apiKey}`;
  });
};
