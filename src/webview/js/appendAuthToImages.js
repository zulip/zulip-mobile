/* @flow strict-local */

import type { Auth } from '../../types';

/**
 * appendAuthToImages
 *
 * Rewrite certain relative <img> URLs to include the needed `api_key`.
 */
export default (auth: Auth) => {
  const imageTags = document.getElementsByTagName('img');
  Array.from(imageTags).forEach(img => {
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
