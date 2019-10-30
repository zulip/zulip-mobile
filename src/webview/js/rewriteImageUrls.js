/* @flow strict-local */

import type { Auth } from '../../types';

/** List of routes which accept the API key appended as a GET parameter. */
const inlineApiRoutes: RegExp[] = ['^/user_uploads/', '^/thumbnail$', '^/avatar/'].map(
  r => new RegExp(r),
);

/**
 * Rewrite the source URLs of <img> tags beneath the specified parent element:
 *
 *   1. Make relative URLs absolute, with a path based on the Zulip realm rather
 *      than the document location.
 *   2. If the source URL names an endpoint known to require authentication,
 *      inject an API key into its query parameters.
 *
 * DEPRECATED: If no parent element is specified, transform every <img> in the
 * entire document.
 */
const rewriteImageUrls = (auth: Auth, element: Element | Document = document) => {
  // The realm, parsed.
  const realm: URL = new URL(auth.realm);

  // Extract all image tags including and/or beneath `element`.
  const imageTags: $ReadOnlyArray<HTMLImageElement> = [].concat(
    element instanceof HTMLImageElement ? [element] : [],
    Array.from(element.getElementsByTagName('img')),
  );

  // Process each image tag.
  imageTags.forEach(img => {
    // Get the raw `src` value from the DOM. (We can't easily use `img.src`,
    // since it's absolutized by the browser.)
    const actualSrc = img.getAttribute('src');

    // Skip completely sourceless elements: they're someone else's problem.
    if (actualSrc == null) {
      return;
    }

    // Compute the absolute URL as though `auth.realm` were the basis.
    const fixedSrc: URL = new URL(actualSrc, realm);

    // If the corrected URL is on this realm...
    if (fixedSrc.origin === realm.origin) {
      // ... check to see if it's a route that needs the API key...
      if (inlineApiRoutes.some(regexp => regexp.test(fixedSrc.pathname))) {
        // ... and append it, if so.
        const delimiter = fixedSrc.search ? '&' : '';
        fixedSrc.search += `${delimiter}api_key=${auth.apiKey}`;
      }
    }

    // Apply effective changes, if any.
    if (img.src !== fixedSrc.href) {
      img.src = fixedSrc.href;
    }
  }); /* for each img */
};

export default rewriteImageUrls;
