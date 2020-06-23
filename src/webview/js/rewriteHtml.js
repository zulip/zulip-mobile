/* @flow strict-local */

import type { Auth } from '../../types';

/** List of routes which accept the API key appended as a GET parameter. */
const inlineApiRoutes: RegExp[] = ['^/user_uploads/', '^/thumbnail$', '^/avatar/'].map(
  r => new RegExp(r),
);

/**
 * Rewrite the source URLs of <img> elements under the given root, inclusive.
 *
 *   1. Make relative URLs absolute, with a path based on the Zulip realm rather
 *      than the document location.
 *   2. If the source URL names an endpoint known to require authentication,
 *      inject an API key into its query parameters.
 */
const rewriteImageUrls = (auth: Auth, element: Element | Document) => {
  const realm = new URL(auth.realm);

  // Find the image elements to act on.
  const imageTags: $ReadOnlyArray<HTMLImageElement> = [].concat(
    element instanceof HTMLImageElement ? [element] : [],
    Array.from(element.getElementsByTagName('img')),
  );

  imageTags.forEach(img => {
    // Not `img.src`, because that getter absolutizes relative URLs itself.
    const actualSrc = img.getAttribute('src');

    // A missing `src` is invalid per the HTML spec.
    if (actualSrc == null) {
      return;
    }

    // 1: Absolutize the URL appropriately.
    const fixedSrc = new URL(actualSrc, realm);

    // 2: Inject the API key where needed.
    if (fixedSrc.origin === realm.origin) {
      if (inlineApiRoutes.some(regexp => regexp.test(fixedSrc.pathname))) {
        // Ideally we'd just use `searchParams`, but that was new in Chrome 51
        // (and Safari 10).
        const delimiter = fixedSrc.search ? '&' : '';
        fixedSrc.search += `${delimiter}api_key=${auth.apiKey}`;
      }
    }

    // The condition is an optimization, in case setting `src` is slow.
    if (img.src !== fixedSrc.toString()) {
      img.src = fixedSrc.toString();
    }
  });
};

/**
 * Modify relevant parts of the rendered DOM tree under the given root,
 * inclusive, to ensure functionality.
 *
 * DEPRECATED: If no root element is specified, the entire document is considered.
 */
const rewriteHTML = (auth: Auth, element: Element | Document = document) => {
  rewriteImageUrls(auth, element);
};

export default rewriteHTML;
