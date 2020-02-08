// @flow strict-local
import * as React from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

import * as logging from '../utils/logging';
import { tryParseUrl } from '../utils/url';
import type { ElementConfigFull } from '../reactUtils';

/**
 * Return a suitable onShouldStartLoadWithRequest for a single-page WebView.
 *
 * When passed as the onShouldStartLoadWithRequest prop to a WebView, the
 * returned callback will ensure that the webview never navigates away from
 * `baseUrl`.
 *
 * This is a hardening measure for our message-list WebView.  We already
 * intercept clicks/touches and open links in a separate browser, but this
 * ensures that if something slips through that it still doesn't break our
 * security assumptions.
 */
// See upstream docs for this WebView prop:
//   https://github.com/react-native-webview/react-native-webview/blob/v11.22.2/docs/Reference.md#onshouldstartloadwithrequest
function makeOnShouldStartLoadWithRequest(
  baseUrl: URL,
): React.ElementConfig<typeof WebView>['onShouldStartLoadWithRequest'] {
  // Inner closure to actually test the URL.
  const urlTester: (url: string) => boolean = (() => {
    // On Android this function is documented to be skipped on first load:
    // therefore, simply never return true.
    if (Platform.OS === 'android') {
      return (url: string) => false;
    }

    // Otherwise (for iOS), return a closure that evaluates to `true` _exactly
    // once_, and even then only if the URL looks like what we're expecting.
    let loaded_once = false;
    return (url: string) => {
      const parsedUrl = tryParseUrl(url);
      if (!loaded_once && parsedUrl && parsedUrl.toString() === baseUrl.toString()) {
        loaded_once = true;
        return true;
      }
      return false;
    };
  })();

  // Outer closure to perform logging.
  return event => {
    const ok = urlTester(event.url);
    if (!ok) {
      logging.warn('webview: rejected navigation event', {
        navigation_event: { ...event },
        expected_url: baseUrl.toString(),
      });
    }
    return ok;
  };
}

/**
 * Render a WebView that shows the given HTML at the given base URL, only.
 *
 * The WebView will show the page described by the HTML string `html`.  Any
 * attempts to navigate to a new page will be rejected.
 *
 * Relative URL references to other resources (scripts, images, etc.) will
 * be resolved relative to `baseUrl`.
 *
 * Assumes `baseUrl` has the scheme `file:`.  No actual file need exist at
 * `baseUrl` itself, because the page is taken from the string `html`.
 */
// TODO: This should ideally be a proper React component of its own.  The
//       thing that may require care when doing that is our use of
//       `shouldComponentUpdate` in its caller, `MessageList`.
export const renderSinglePageWebView = (
  html: string,
  baseUrl: URL,
  moreProps: $Rest<
    ElementConfigFull<typeof WebView>,
    {| source: mixed, originWhitelist: mixed, onShouldStartLoadWithRequest: mixed |},
  >,
): React.Node => (
  // The `originWhitelist` and `onShouldStartLoadWithRequest` props are
  // meant to mitigate possible XSS bugs, by interrupting an attempted
  // exploit if it tries to navigate to a new URL by e.g. setting
  // `window.location`.
  //
  // Note that neither of them is a hard security barrier; they're checked
  // only against the URL of the document itself.  They cannot be used to
  // validate the URL of other resources the WebView loads.
  //
  // Worse, the `originWhitelist` parameter is completely broken. See:
  // https://github.com/react-native-community/react-native-webview/pull/697
  <WebView
    source={{ baseUrl: (baseUrl.toString(): string), html: (html: string) }}
    originWhitelist={['file://']}
    onShouldStartLoadWithRequest={makeOnShouldStartLoadWithRequest(baseUrl)}
    {...moreProps}
  />
);
