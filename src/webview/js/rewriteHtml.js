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
  const realm = auth.realm;

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
    let fixedSrc;
    try {
      fixedSrc = new URL(actualSrc, realm);
    } catch {
      // If the URL doesn't parse, there's nothing we can do for it.
      // Just in case it doesn't parse as relative to `realm` but *would*
      // parse as relative to the webview's base URL, though, rewrite it to
      // something that definitely points nowhere.
      img.src = 'about:blank';
      return;
    }

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
 * Rewrite the 'time' elements under the given root, inclusive, to make them more readable.
 *
 * 1. Changes text to localized human readable date-time.
 * 2. Adds 'original-text' attribrute, to show original text alert dialog on press.
 */
const rewriteTime = (element: Element | Document) => {
  // Find the time elements to act on.
  const timeElements = [].concat(
    element instanceof HTMLTimeElement ? [element] : [],
    Array.from(element.getElementsByTagName('time')),
  );

  timeElements.forEach(elem => {
    // Present only because the Flow DOM libdef does not have a specific definition
    // for `getElementsByTagName('time')`, so the typedef of `timeElements` is wider
    // than it actually is. See https://github.com/facebook/flow/issues/8450.
    if (!(elem instanceof HTMLTimeElement)) {
      return;
    }

    const timeStamp = elem.dateTime;
    const text = elem.innerText;

    const d = new Date(timeStamp);
    elem.setAttribute('original-text', text);
    elem.innerText = `🕒  ${d.toLocaleString(undefined, {
      dateStyle: 'full',
      timeStyle: 'short',
    })}`;
  });
};

/**
 * Add missing elements to spoiler blocks under the given root, inclusive.
 *
 * 1. Adds 'Spoiler' header text if missing.
 * 2. Adds the spoiler expanded arrow indicator. The arrow is rendered using CSS.
 *
 * Does what the web app does, only departing as appropriate to adapt
 * to mobile. The corresponding code is in
 * static/js/rendered_markdown.js, at the spot you find searching for
 * "spoiler-header". That's lines 181-192 in zulip/zulip@c5dc9d386.
 */
const rewriteSpoilers = (element: Element | Document) => {
  const spoilerHeaders: NodeList<HTMLElement> = element.querySelectorAll('div.spoiler-header');
  spoilerHeaders.forEach(e => {
    // Add the expand/collapse button to spoiler blocks
    const toggle_button_html =
      '<span class="spoiler-button" aria-expanded="false"><span class="spoiler-arrow"></span></span>';
    if (e.innerText === '') {
      // If a spoiler block has no header content, it should have a default header.
      // We do this client side to allow for i18n by the client.
      const header_html = '<p>Spoiler</p>'; // TODO: Localize this text.
      e.innerHTML = toggle_button_html + header_html;
    } else {
      e.innerHTML = toggle_button_html + e.innerHTML;
    }
  });
};

/**
 * Modify relevant parts of the rendered DOM tree under the given root,
 * inclusive, to ensure functionality.
 *
 * DEPRECATED: If no root element is specified, the entire document is considered.
 */
const rewriteHtml = (auth: Auth, element: Element | Document = document) => {
  rewriteImageUrls(auth, element);
  rewriteTime(element);
  rewriteSpoilers(element);
};

export default rewriteHtml;
