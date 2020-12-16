/* @flow strict-local */
import React from 'react';
import { Platform, NativeModules } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { tryParseUrl } from '../utils/url';
import * as logging from '../utils/logging';

/**
 * Returns the `onShouldStartLoadWithRequest` function for webviews for a
 * given base URL.
 *
 * Paranoia^WSecurity: only load `baseUrl`, and only load it once. Any other
 * requests should be handed off to the OS, not loaded inside the WebView.
 */
const getOnShouldStartLoadWithRequest = (baseUrl: string) => {
  const onShouldStartLoadWithRequest: (event: WebViewNavigation) => boolean = (() => {
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
    return (event: WebViewNavigation) => {
      const ok = urlTester(event.url);
      if (!ok) {
        logging.warn('webview: rejected navigation event', {
          navigation_event: { ...event },
          expected_url: baseUrl.toString(),
        });
      }
      return ok;
    };
  })();

  return onShouldStartLoadWithRequest;
};

/**
 * The URL of the platform-specific assets folder.
 *
 * - On iOS: We can't easily hardcode this because it includes UUIDs.
 *   So we bring it over the React Native bridge in ZLPConstants.m.
 *
 * - On Android: Different apps' WebViews see different (virtual) root
 *   directories as `file:///`, and in particular the WebView provides
 *   the APK's `assets/` directory as `file:///android_asset/`. [1]
 *   We can easily hardcode that, so we do.
 *
 * [1] Oddly, this essential feature doesn't seem to be documented!  It's
 *     widely described in how-tos across the web and StackOverflow answers.
 *     It's assumed in some related docs which mention it in passing, and
 *     treated matter-of-factly in some Chromium bug threads.  Details at:
 *     https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/android.20filesystem/near/796440
 */
const assetsUrl =
  Platform.OS === 'ios'
    ? new URL(NativeModules.ZLPConstants.resourceURL)
    : new URL('file:///android_asset/');

/**
 * The URL of the webview-assets folder.
 *
 * This is the folder populated at build time by `tools/build-webview`.
 */
const webviewAssetsUrl = new URL('webview/', assetsUrl);

type Props = $ReadOnly<{|
  html: string,
  onMessage?: WebViewMessageEvent => mixed,
  onError?: (event: mixed) => void,
|}>;

/**
 * A wrapper over React Native Webview. Internally configures basic functionality
 * and security.
 *
 * This is a stateless function component, to ensure there are no un-necessary
 * re-renders of the webview due to state changes.
 *
 * @prop html The HTML to be rendered.
 * @prop onMessage Message event handler for the webview.
 * @prop onError Error event handler for the webview.
 */
const ZulipWebView = function ZulipWebView(
  props: $ReadOnly<{|
    ...Props,
    innerRef: ((null | WebView) => mixed) | { current: null | WebView },
  |}>,
) {
  const { onMessage, onError, innerRef } = props;

  /**
   * Effective URL of the MessageList webview.
   *
   * It points to `index.html` in the webview-assets folder, which
   * doesn't exist.
   *
   * It doesn't need to exist because we provide all HTML at
   * creation (or refresh) time. This serves only as a placeholder,
   * so that relative URLs (e.g., to `base.css`, which does exist)
   * and cross-domain security restrictions have somewhere to
   * believe that this document originates from.
   */
  const baseUrl = new URL('index.html', webviewAssetsUrl);

  // Needs to be declared explicitly to prevent Flow from getting confused.
  const html: string = props.html;

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
  return (
    <WebView
      source={{ baseUrl: (baseUrl.toString(): string), html }}
      originWhitelist={['file://']}
      onShouldStartLoadWithRequest={getOnShouldStartLoadWithRequest(baseUrl.toString())}
      style={{ backgroundColor: 'transparent' }}
      onMessage={onMessage}
      onError={onError}
      ref={innerRef}
    />
  );
};

export default React.forwardRef<Props, WebView>((props, ref) => (
  <ZulipWebView innerRef={ref} {...props} />
));
