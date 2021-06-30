// We have not transcribed the types corresponding to Windows and
// macOS support, e.g., from
// react-native-community/react-native-webview@ffee0d436 and
// react-native-community/react-native-webview@1e572318e.

/*
 * Types copied (completely or incompletely) from `react-native`; we
 * can't import them. See
 * https://github.com/zulip/zulip-mobile/issues/3458#issuecomment-639859987
 * and
 * https://github.com/flow-typed/flow-typed/blob/master/CONTRIBUTING.md#dont-import-types-from-other-libdefs
 */
declare module 'react-native-webview/@@react-native' {
  declare type NativeScrollRectangle = {
    left: number,
    top: number,
    bottom: number,
    right: number,
  };

  declare type NativeScrollPoint = {
    x: number,
    y: number,
  };

  declare type NativeScrollVelocity = {
    x: number,
    y: number,
  };

  declare type NativeScrollSize = {
    height: number,
    width: number,
  };

  // May be incomplete; see `react-native/Libraries/Types/CoreEventTypes`
  declare export type ScrollEvent = {
    contentInset: NativeScrollRectangle,
    contentOffset: NativeScrollPoint,
    contentSize: NativeScrollSize,
    layoutMeasurement: NativeScrollSize,
    velocity?: NativeScrollVelocity,
    zoomScale: number,
  };

  // Incomplete; see `react-native/Libraries/Types/CoreEventTypes`
  declare export type SyntheticEvent<T> = { +nativeEvent: T };

  // Incomplete; see react-native/Libraries/StyleSheet/StyleSheet
  declare export type ViewStyleProp = { ... };

  // Incomplete; see react-native/Libraries/Components/View/ViewPropTypes
  declare export type ViewProps = {|
    style?: ?ViewStyleProp,
  |};
}

declare module 'react-native-webview' {
  import type {
    ScrollEvent,
    SyntheticEvent,
    ViewProps,
    ViewStyleProp,
  } from 'react-native-webview/@@react-native';

  declare export type MixedContentMode = 'never' | 'always' | 'compatibility';
  declare export type FileDownload = { downloadUrl: string };
  declare export type DecelerationRateConstant = 'normal' | 'fast';
  declare export type OverScrollModeType = 'always' | 'content' | 'never';

  declare export type CacheMode =
    | 'LOAD_DEFAULT'
    | 'LOAD_CACHE_ONLY'
    | 'LOAD_CACHE_ELSE_NETWORK'
    | 'LOAD_NO_CACHE';

  declare export type NavigationType =
    | 'click'
    | 'formsubmit'
    | 'backforward'
    | 'reload'
    | 'formresubmit'
    | 'other';
  declare export type DataDetectorTypes =
    | 'phoneNumber'
    | 'link'
    | 'address'
    | 'calendarEvent'
    | 'trackingNumber'
    | 'flightNumber'
    | 'lookupSuggestion'
    | 'none'
    | 'all';

  declare export type WebViewNativeEvent = $ReadOnly<{|
    url: string,
    loading: boolean,
    title: string,
    canGoBack: boolean,
    canGoForward: boolean,
    lockIdentifier: number,
  |}>;

  declare export type WebViewNavigation = $ReadOnly<{|
    ...WebViewNativeEvent,
    navigationType: NavigationType,
  |}>;

  declare export type WebViewNativeProgressEvent = $ReadOnly<{|
    ...WebViewNativeEvent,
    progress: number,
  |}>;

  declare export type WebViewMessage = $ReadOnly<{|
    ...WebViewNativeEvent,
    data: string,
  |}>;

  declare export type WebViewError = $ReadOnly<{|
    ...WebViewNativeEvent,
    domain?: string,
    code: number,
    description: string,
  |}>;

  declare export type WebViewHttpError = $ReadOnly<{|
    ...WebViewNativeEvent,
    description: string,
    statusCode: number,
  |}>;

  declare export type ContentInsetProp = {|
    top?: number,
    left?: number,
    bottom?: number,
    right?: number,
  |};

  declare export type WebViewSourceUri = {|
    uri?: string,
    method?: string,
    headers?: {| [string]: string |},
    body?: string,
  |};

  declare export type WebViewSourceHtml = {|
    html?: string,
    baseUrl?: string,
  |};

  declare export type WebViewSource = {|
    ...WebViewSourceUri,
    ...WebViewSourceHtml,
  |};

  declare export type WebViewNativeConfig = {|
    component?: React$ComponentType<WebViewSharedProps>,
    props?: {},
    viewManager?: {},
  |};

  declare export type WebViewEvent = SyntheticEvent<WebViewNativeEvent>;
  declare export type WebViewNavigationEvent = SyntheticEvent<WebViewNavigation>;
  declare export type FileDownloadEvent = NativeSyntheticEvent<FileDownload>;
  declare export type WebViewMessageEvent = SyntheticEvent<WebViewMessage>;
  declare export type WebViewErrorEvent = SyntheticEvent<WebViewError>;
  declare export type WebViewHttpErrorEvent = SyntheticEvent<WebViewHttpError>;
  declare export type WebViewTerminatedEvent = SyntheticEvent<WebViewNativeEvent>;
  declare export type WebViewProgressEvent = SyntheticEvent<WebViewNativeProgressEvent>;
  declare export type OnShouldStartLoadWithRequest = (event: WebViewNavigation) => boolean;

  declare export type IOSOnlyWebViewProps = {|
    /**
     * Does not store any data within the lifetime of the WebView.
     */
    incognito?: boolean,

    /**
     * Boolean value that determines whether the web view bounces
     * when it reaches the edge of the content. The default value is `true`.
     * @platform ios
     */
    bounces?: boolean,

    /**
     * A floating-point number that determines how quickly the scroll view
     * decelerates after the user lifts their finger. You may also use the
     * string shortcuts `"normal"` and `"fast"` which match the underlying iOS
     * settings for `UIScrollViewDecelerationRateNormal` and
     * `UIScrollViewDecelerationRateFast` respectively:
     *
     *   - normal: 0.998
     *   - fast: 0.99 (the default for iOS web view)
     * @platform ios
     */
    decelerationRate?: DecelerationRateConstant | number,

    /**
     * Boolean value that determines whether scrolling is enabled in the
     * `WebView`. The default value is `true`.
     * @platform ios
     */
    scrollEnabled?: boolean,

    /**
     * If the value of this property is true, the scroll view stops on multiples
     * of the scroll view’s bounds when the user scrolls.
     * The default value is false.
     * @platform ios
     */
    pagingEnabled?: boolean,

    /**
     * Controls whether to adjust the content inset for web views that are
     * placed behind a navigation bar, tab bar, or toolbar. The default value
     * is `true`.
     * @platform ios
     */
    automaticallyAdjustContentInsets?: boolean,

    /**
     * This property specifies how the safe area insets are used to modify the
     * content area of the scroll view. The default value of this property is
     * "never". Available on iOS 11 and later.
     */
    contentInsetAdjustmentBehavior?: 'automatic' | 'scrollableAxes' | 'never' | 'always',

    /**
     * The amount by which the web view content is inset from the edges of
     * the scroll view. Defaults to {top: 0, left: 0, bottom: 0, right: 0}.
     * @platform ios
     */
    contentInset?: ContentInsetProp,

    /**
     * Determines the types of data converted to clickable URLs in the web view's content.
     * By default only phone numbers are detected.
     *
     * You can provide one type or an array of many types.
     *
     * Possible values for `dataDetectorTypes` are:
     *
     * - `'phoneNumber'`
     * - `'link'`
     * - `'address'`
     * - `'calendarEvent'`
     * - `'none'`
     * - `'all'`
     *
     * With the new WebKit implementation, we have three new values:
     * - `'trackingNumber'`,
     * - `'flightNumber'`,
     * - `'lookupSuggestion'`,
     *
     * @platform ios
     */
    dataDetectorTypes?: DataDetectorTypes | Array<DataDetectorTypes>,

    /**
     * Boolean that determines whether HTML5 videos play inline or use the
     * native full-screen controller. The default value is `false`.
     *
     * **NOTE** : In order for video to play inline, not only does this
     * property need to be set to `true`, but the video element in the HTML
     * document must also include the `webkit-playsinline` attribute.
     * @platform ios
     */
    allowsInlineMediaPlayback?: boolean,

    /**
     * Hide the accessory view when the keyboard is open. Default is false to be
     * backward compatible.
     */
    hideKeyboardAccessoryView?: boolean,

    /**
     * A Boolean value indicating whether horizontal swipe gestures will trigger
     * back-forward list navigations.
     */
    allowsBackForwardNavigationGestures?: boolean,

    /**
     * A Boolean value indicating whether WebKit WebView should be created using a shared
     * process pool, enabling WebViews to share cookies and localStorage between each other.
     * Default is true but can be set to false for backwards compatibility.
     * @platform ios
     */
    useSharedProcessPool?: boolean,

    /**
     * The custom user agent string.
     */
    userAgent?: string,

    /**
     * A Boolean value that determines whether pressing on a link
     * displays a preview of the destination for the link.
     *
     * This property is available on devices that support 3D Touch.
     * In iOS 10 and later, the default value is `true`; before that, the default value is `false`.
     * @platform ios
     */
    allowsLinkPreview?: boolean,

    /**
     * Set true if shared cookies from HTTPCookieStorage should used for every load request.
     * The default value is `false`.
     * @platform ios
     */
    sharedCookiesEnabled?: boolean,

    /**
     * A Boolean value that determines whether scrolling is disabled in a particular direction.
     * The default value is `true`.
     * @platform ios
     */
    directionalLockEnabled?: boolean,

    /**
     * A Boolean value indicating whether web content can programmatically display the keyboard.
     *
     * When this property is set to true, the user must explicitly tap the elements in the
     * web view to display the keyboard (or other relevant input view) for that element.
     * When set to false, a focus event on an element causes the input view to be displayed
     * and associated with that element automatically.
     *
     * The default value is `true`.
     * @platform ios
     */
    keyboardDisplayRequiresUserAction?: boolean,

    /**
     * A String value that indicates which URLs the WebView's file can then
     * reference in scripts, AJAX requests, and CSS imports. This is only used
     * for WebViews that are loaded with a source.uri set to a `'file://'` URL.
     *
     * If not provided, the default is to only allow read access to the URL
     * provided in source.uri itself.
     * @platform ios
     */
    allowingReadAccessToURL?: string,

    /**
     * Function that is invoked when the WebKit WebView content process gets terminated.
     * @platform ios
     */
    onContentProcessDidTerminate?: WebViewTerminatedEvent => mixed,

    /**
     * If `true` (default), loads the `injectedJavaScript` only into the main frame.
     * If `false`, loads it into all frames (e.g. iframes).
     * @platform ios
     */
    injectedJavaScriptForMainFrameOnly?: boolean,

    /**
     * If `true` (default), loads the `injectedJavaScriptBeforeContentLoaded` only into the main frame.
     * If `false`, loads it into all frames (e.g. iframes).
     * @platform ios
     */
    injectedJavaScriptBeforeContentLoadedForMainFrameOnly?: boolean,

    /**
     * Function that is invoked when the client needs to download a file.
     *
     * iOS 13+ only: If the webview navigates to a URL that results in an HTTP
     * response with a Content-Disposition header 'attachment...', then
     * this will be called.
     *
     * iOS 8+: If the MIME type indicates that the content is not renderable by the
     * webview, that will also cause this to be called. On iOS versions before 13,
     * this is the only condition that will cause this function to be called.
     *
     * The application will need to provide its own code to actually download
     * the file.
     *
     * If not provided, the default is to let the webview try to render the file.
     */
    onFileDownload?: (event: FileDownloadEvent) => void,
  |};

  declare export type IOSWebViewProps = {| ...IOSOnlyWebViewProps, ...WebViewSharedProps |};

  declare export type AndroidOnlyWebViewProps = {|
    onContentSizeChange?: WebViewEvent => mixed,

    /**
     * Boolean value to enable JavaScript in the `WebView`. Used on Android only
     * as JavaScript is enabled by default on iOS. The default value is `true`.
     * @platform android
     */
    javaScriptEnabled?: boolean,

    /**
     * https://developer.android.com/reference/android/webkit/WebSettings.html#setCacheMode(int)
     * Set the cacheMode. Possible values are:
     *
     * - `'LOAD_DEFAULT'` (default)
     * - `'LOAD_CACHE_ELSE_NETWORK'`
     * - `'LOAD_NO_CACHE'`
     * - `'LOAD_CACHE_ONLY'`
     *
     * @platform android
     */
    cacheMode?: CacheMode,

    /**
     * https://developer.android.com/reference/android/view/View#OVER_SCROLL_NEVER
     * Sets the overScrollMode. Possible values are:
     *
     * - `'always'` (default)
     * - `'content'`
     * - `'never'`
     *
     * @platform android
     */
    overScrollMode?: OverScrollModeType,

    /**
     * Boolean that controls whether the web content is scaled to fit
     * the view and enables the user to change the scale. The default value
     * is `true`.
     */
    scalesPageToFit?: boolean,

    /**
     * Sets whether Geolocation is enabled. The default is false.
     * @platform android
     */
    geolocationEnabled?: boolean,

    /**
     * Boolean that sets whether JavaScript running in the context of a file
     * scheme URL should be allowed to access content from other file scheme URLs.
     * Including accessing content from other file scheme URLs
     * @platform android
     */
    allowFileAccessFromFileURLs?: boolean,

    /**
     * Boolean that sets whether JavaScript running in the context of a file
     * scheme URL should be allowed to access content from any origin.
     * Including accessing content from other file scheme URLs
     * @platform android
     */
    allowUniversalAccessFromFileURLs?: boolean,

    /**
     * Sets whether the webview allow access to file system.
     * @platform android
     */
    allowFileAccess?: boolean,

    /**
     * Used on Android only, controls whether form autocomplete data should be saved
     * @platform android
     */
    saveFormDataDisabled?: boolean,

    /**
     * Used on Android only, controls whether the given list of URL prefixes should
     * make {@link com.facebook.react.views.webview.ReactWebViewClient} to launch a
     * default activity intent for those URL instead of loading it within the webview.
     * Use this to list URLs that WebView cannot handle, e.g. a PDF url.
     * @platform android
     */
    urlPrefixesForDefaultIntent?: Array<string>,

    /**
     * Boolean value to disable Hardware Acceleration in the `WebView`. Used on Android only
     * as Hardware Acceleration is a feature only for Android. The default value is `false`.
     * @platform android
     */
    androidHardwareAccelerationDisabled?: boolean,

    /**
     * Boolean value to enable third party cookies in the `WebView`. Used on
     * Android Lollipop and above only as third party cookies are enabled by
     * default on Android Kitkat and below and on iOS. The default value is `true`.
     * @platform android
     */
    thirdPartyCookiesEnabled?: boolean,

    /**
     * Boolean value to control whether DOM Storage is enabled. Used only in
     * Android.
     * @platform android
     */
    domStorageEnabled?: boolean,

    /**
     * Sets the user-agent for the `WebView`.
     * @platform android
     */
    userAgent?: string,

    /**
     * Sets number that controls text zoom of the page in percent.
     * @platform android
     */
    textZoom?: number,

    /**
     * Specifies the mixed content mode. i.e WebView will allow a secure origin to load content from any other origin.
     *
     * Possible values for `mixedContentMode` are:
     *
     * - `'never'` (default) - WebView will not allow a secure origin to load content from an insecure origin.
     * - `'always'` - WebView will allow a secure origin to load content from any other origin, even if that origin is insecure.
     * - `'compatibility'` -  WebView will attempt to be compatible with the approach of a modern web browser with regard to mixed content.
     * @platform android
     */
    mixedContentMode?: MixedContentMode,

    /**
     * Sets ability to open fullscreen videos on Android devices.
     */
    allowsFullscreenVideo?: boolean,
  |};

  declare export type AndroidWebViewProps = {| ...AndroidOnlyWebViewProps, ...WebViewSharedProps |};

  declare export type WebViewSharedProps = {|
    /**
     * Props like `style` that can be passed to a `View` component.
     *
     * See note at 'react-native-webview/@@react-native', above; this
     * is incomplete.
     */
    ...ViewProps,

    /**
     * Loads static html or a uri (with optional headers) in the WebView.
     */
    source?: WebViewSource,

    /**
     * Boolean value to enable JavaScript in the `WebView`. Used on Android only
     * as JavaScript is enabled by default on iOS. The default value is `true`.
     * @platform android
     */
    javaScriptEnabled?: boolean,

    /**
     * Stylesheet object to set the style of the container view.
     */
    containerStyle?: ViewStyleProp,

    /**
     * Function that returns a view to show if there's an error.
     */
    renderError?: (
      errorDomain: ?string,
      errorCode: number,
      errorDesc: string,
    ) => React$Element<any>,

    /**
     * Function that returns a loading indicator.
     */
    renderLoading?: () => React$Element<any>,

    /**
     * Function that is invoked when the `WebView` scrolls.
     */
    onScroll?: ScrollEvent => mixed,

    /**
     * Function that is invoked when the `WebView` has finished loading.
     */
    onLoad?: WebViewNavigationEvent => mixed,

    /**
     * Function that is invoked when the `WebView` load succeeds or fails.
     */
    onLoadEnd?: (WebViewNavigationEvent | WebViewErrorEvent) => mixed,

    /**
     * Function that is invoked when the `WebView` starts loading.
     */
    onLoadStart?: WebViewNavigationEvent => mixed,

    /**
     * Function that is invoked when the `WebView` load fails.
     */
    onError?: WebViewErrorEvent => mixed,

    /**
     * Function that is invoked when the `WebView` receives an error status code.
     * Works on iOS and Android (minimum API level 23).
     */
    onHttpError?: WebViewHttpErrorEvent => mixed,

    /**
     * Function that is invoked when the `WebView` loading starts or ends.
     */
    onNavigationStateChange?: WebViewNavigation => mixed,

    /**
     * Function that is invoked when the webview calls `window.ReactNativeWebView.postMessage`.
     * Setting this property will inject this global into your webview.
     *
     * `window.ReactNativeWebView.postMessage` accepts one argument, `data`, which will be
     * available on the event object, `event.nativeEvent.data`. `data` must be a string.
     */
    onMessage?: WebViewMessageEvent => mixed,

    /**
     * Function that is invoked when the `WebView` is loading.
     */
    onLoadProgress?: WebViewProgressEvent => mixed,

    /**
     * Boolean value that forces the `WebView` to show the loading view
     * on the first load.
     */
    startInLoadingState?: boolean,

    /**
     * Set this to provide JavaScript that will be injected into the web page
     * when the view loads.
     */
    injectedJavaScript?: string,

    /**
     * Set this to provide JavaScript that will be injected into the web page
     * once the webview is initialized but before the view loads any content.
     */
    injectedJavaScriptBeforeContentLoaded?: string,

    /**
     * Boolean value that determines whether a horizontal scroll indicator is
     * shown in the `WebView`. The default value is `true`.
     */
    showsHorizontalScrollIndicator?: boolean,

    /**
     * Boolean value that determines whether a vertical scroll indicator is
     * shown in the `WebView`. The default value is `true`.
     */
    showsVerticalScrollIndicator?: boolean,

    /**
     * Boolean that determines whether HTML5 audio and video requires the user
     * to tap them before they start playing. The default value is `true`.
     */
    mediaPlaybackRequiresUserAction?: boolean,

    /**
     * List of origin strings to allow being navigated to. The strings allow
     * wildcards and get matched against *just* the origin (not the full URL).
     * If the user taps to navigate to a new page but the new page is not in
     * this whitelist, we will open the URL in Safari.
     * The default whitelisted origins are "http://*" and "https://*".
     */
    originWhitelist?: Array<string>,

    /**
     * Function that allows custom handling of any web view requests. Return
     * `true` from the function to continue loading the request and `false`
     * to stop loading. The `navigationType` is always `other` on android.
     */
    onShouldStartLoadWithRequest?: OnShouldStartLoadWithRequest,

    /**
     * Override the native component used to render the WebView. Enables a custom native
     * WebView which uses the same JavaScript as the original WebView.
     */
    nativeConfig?: WebViewNativeConfig,

    /**
     * Should caching be enabled. Default is true.
     */
    cacheEnabled?: boolean,

    userAgent?: string,
    incognito?: boolean,
    applicationNameForUserAgent?: string,
  |};

  declare export type WebViewProps = {| ...IOSWebViewProps, ...AndroidWebViewProps |};

  declare export class WebView extends React$Component<WebViewProps> {
    static extraNativeComponentConfig(): any;

    goBack(): void;
    goForward(): void;
    reload(): void;
    stopLoading(): void;
    injectJavaScript(script: string): void;
    requestFocus(): void;
  }

  declare export default typeof WebView;
}
