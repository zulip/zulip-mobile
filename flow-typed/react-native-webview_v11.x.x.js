/*
 * Types (complete or incomplete) translated from @types/react-native at the
 * version react-native-webview uses. Translation done with Flowgen v1.14.1.
 *
 * Done with `--interface-records` and `--no-inexact`, and edited lightly.
 */
declare module 'react-native-webview/@@react-native' {
  declare type Constructor<T> = (...args: any[]) => T;

  /**
   * NativeMethods provides methods to access the underlying native component directly.
   * This can be useful in cases when you want to focus a view or measure its on-screen dimensions,
   * for example.
   * The methods described here are available on most of the default components provided by React Native.
   * Note, however, that they are not available on composite components that aren't directly backed by a
   * native view. This will generally include most components that you define in your own app.
   * For more information, see [Direct Manipulation](http://facebook.github.io/react-native/docs/direct-manipulation.html).
   * @see https://github.com/facebook/react-native/blob/master/Libraries/ReactIOS/NativeMethodsMixin.js
   */
  declare export type NativeMethods = {|
    measure(callback: MeasureOnSuccessCallback): void,
    measureInWindow(callback: MeasureInWindowOnSuccessCallback): void,
    measureLayout(
      relativeToNativeNode: number,
      onSuccess: MeasureLayoutOnSuccessCallback,
      onFail: () => void,
    ): void,
    setNativeProps(nativeProps: Object): void,
    focus(): void,
    blur(): void,
    refs: {|
      [key: string]: React$ComponentType<any, any>,
    |},
  |};

  /**
   * @deprecated Use NativeMethods instead.
   */
  declare export type NativeMethodsMixin = NativeMethods;

  declare type NodeHandle = number;

  // Similar to React.SyntheticEvent except for nativeEvent
  declare export type NativeSyntheticEvent<T> = {|
    ...$Exact<React$BaseSyntheticEvent<T, NodeHandle, NodeHandle>>,
  |};

  declare export type NativeScrollEvent = {|
    contentInset: NativeScrollRectangle,
    contentOffset: NativeScrollPoint,
    contentSize: NativeScrollSize,
    layoutMeasurement: NativeScrollSize,
    velocity?: NativeScrollVelocity,
    zoomScale: number,
  |};

  declare export type UIManagerStatic = {|
    /**
     * Capture an image of the screen, window or an individual view. The image
     * will be stored in a temporary file that will only exist for as long as the
     * app is running.
     *
     * The `view` argument can be the literal string `window` if you want to
     * capture the entire window, or it can be a reference to a specific
     * React Native component.
     *
     * The `options` argument may include:
     * - width/height (number) - the width and height of the image to capture.
     * - format (string) - either 'png' or 'jpeg'. Defaults to 'png'.
     * - quality (number) - the quality when using jpeg. 0.0 - 1.0 (default).
     *
     * Returns a Promise<string> (tempFilePath)
     * @platform ios
     */
    takeSnapshot: (
      view?: 'window' | React$Element<React$ElementType> | number,
      options?: {|
        width?: number,
        height?: number,
        format?: 'png' | 'jpeg',
        quality?: number,
      |},
    ) => Promise<string>,

    /**
     * Determines the location on screen, width, and height of the given view and
     * returns the values via an async callback. If successful, the callback will
     * be called with the following arguments:
     *
     *  - x
     *  - y
     *  - width
     *  - height
     *  - pageX
     *  - pageY
     *
     * Note that these measurements are not available until after the rendering
     * has been completed in native. If you need the measurements as soon as
     * possible, consider using the [`onLayout`
     * prop](docs/view.html#onlayout) instead.
     *
     * @deprecated Use `ref.measure` instead.
     */
    measure(node: number, callback: MeasureOnSuccessCallback): void,

    /**
     * Determines the location of the given view in the window and returns the
     * values via an async callback. If the React root view is embedded in
     * another native view, this will give you the absolute coordinates. If
     * successful, the callback will be called with the following
     * arguments:
     *
     *  - x
     *  - y
     *  - width
     *  - height
     *
     * Note that these measurements are not available until after the rendering
     * has been completed in native.
     *
     * @deprecated Use `ref.measureInWindow` instead.
     */
    measureInWindow(node: number, callback: MeasureInWindowOnSuccessCallback): void,

    /**
     * Like [`measure()`](#measure), but measures the view relative an ancestor,
     * specified as `relativeToNativeNode`. This means that the returned x, y
     * are relative to the origin x, y of the ancestor view.
     *
     * As always, to obtain a native node handle for a component, you can use
     * `React.findNodeHandle(component)`.
     *
     * @deprecated Use `ref.measureLayout` instead.
     */
    measureLayout(
      node: number,
      relativeToNativeNode: number,
      onFail: () => void,
      onSuccess: MeasureLayoutOnSuccessCallback,
    ): void,

    /**
     * Automatically animates views to their new positions when the
     * next layout happens.
     *
     * A common way to use this API is to call it before calling `setState`.
     *
     * Note that in order to get this to work on **Android** you need to set the following flags via `UIManager`:
     *
     *     UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
     */
    setLayoutAnimationEnabledExperimental(value: boolean): void,

    /**
     * Used to display an Android PopupMenu. If a menu item is pressed, the success callback will
     * be called with the following arguments:
     *
     *  - item - the menu item.
     *  - index - index of the pressed item in array. Returns `undefined` if cancelled.
     *
     * To obtain a native node handle for a component, you can use
     * `React.findNodeHandle(component)`.
     *
     * Note that this works only on Android
     */
    showPopupMenu(
      node: number,
      items: string[],
      error: () => void,
      success: (item: string, index: number | void) => void,
    ): void,

    getViewManagerConfig: (
      name: string,
    ) => {|
      Commands: {|
        [key: string]: number,
      |},
    |},

    /**
     * Used to call a native view method from JavaScript
     *
     * reactTag - Id of react view.
     * commandID - Id of the native method that should be called.
     * commandArgs - Args of the native method that we can pass from JS to native.
     */
    dispatchViewManagerCommand: (
      reactTag: number | null,
      commandID: number,
      commandArgs?: Array<any>,
    ) => void,
  |};

  declare type Falsy = void | null | false;
  declare type RecursiveArray<T> = Array<T | RecursiveArray<T> | $ReadOnlyArray<T>>;
  /**
   * Keep a brand of 'T' so that calls to `StyleSheet.flatten` can take `RegisteredStyle<T>` and return `T`.
   */
  declare type RegisteredStyle<T> = {|
    ...number,
    ...{|
      __registeredStyleBrand: T,
    |},
  |};
  declare export type StyleProp<T> =
    | T
    | RegisteredStyle<T>
    | RecursiveArray<T | RegisteredStyle<T> | Falsy>
    | Falsy;

  // not the actual definition; that's verbose
  declare export type ViewStyle = { ... };

  // not the actual definition; that's verbose
  declare export type ViewProps = {| style: StyleProp<ViewStyle> |};
}

/*
 * Types translated from lib/WebViewTypes.d.ts and lib/WebView.d.ts, with
 * Flowgen v1.14.1.
 *
 * Done with `--interface-records` and `--no-inexact`, and edited lightly.
 */
declare module 'react-native-webview' {
  //
  // node_modules/react-native-webview/lib/WebViewTypes.d.ts
  //

  import type {
    NativeSyntheticEvent,
    ViewProps,
    StyleProp,
    ViewStyle,
    NativeMethodsMixin,
    Constructor,
    UIManagerStatic,
    NativeScrollEvent,
  } from 'react-native-webview/@@react-native';

  declare type WebViewCommands =
    | 'goForward'
    | 'goBack'
    | 'reload'
    | 'stopLoading'
    | 'postMessage'
    | 'injectJavaScript'
    | 'loadUrl'
    | 'requestFocus';
  declare type AndroidWebViewCommands = 'clearHistory' | 'clearCache' | 'clearFormData';
  declare type RNCWebViewUIManager<Commands: string> = {|
    ...$Exact<UIManagerStatic>,

    getViewManagerConfig: (
      name: string,
    ) => {|
      Commands: $ObjMapi<{| [k: Commands]: any |}, <key>(key) => number>,
    |},
  |};
  declare export type RNCWebViewUIManagerAndroid = RNCWebViewUIManager<
    WebViewCommands | AndroidWebViewCommands, >;
  declare export type RNCWebViewUIManagerIOS = RNCWebViewUIManager<WebViewCommands>;
  declare export type RNCWebViewUIManagerMacOS = RNCWebViewUIManager<WebViewCommands>;
  declare export type RNCWebViewUIManagerWindows = RNCWebViewUIManager<WebViewCommands>;
  declare type WebViewState = 'IDLE' | 'LOADING' | 'ERROR';
  declare type BaseState = {|
    viewState: WebViewState,
  |};
  declare type NormalState = {|
    ...$Exact<BaseState>,

    viewState: 'IDLE' | 'LOADING',
    lastErrorEvent: WebViewError | null,
  |};
  declare type ErrorState = {|
    ...$Exact<BaseState>,

    viewState: 'ERROR',
    lastErrorEvent: WebViewError,
  |};
  declare export type State = NormalState | ErrorState;
  declare var NativeWebViewIOSComponent: React$ComponentType<IOSNativeWebViewProps>;
  declare var NativeWebViewIOSBase: Constructor<NativeMethodsMixin> &
    typeof NativeWebViewIOSComponent;
  declare export class NativeWebViewIOS mixins NativeWebViewIOSBase {}
  declare var NativeWebViewMacOSComponent: React$ComponentType<MacOSNativeWebViewProps>;
  declare var NativeWebViewMacOSBase: Constructor<NativeMethodsMixin> &
    typeof NativeWebViewMacOSComponent;
  declare export class NativeWebViewMacOS mixins NativeWebViewMacOSBase {}
  declare var NativeWebViewAndroidComponent: React$ComponentType<AndroidNativeWebViewProps>;
  declare var NativeWebViewAndroidBase: Constructor<NativeMethodsMixin> &
    typeof NativeWebViewAndroidComponent;
  declare export class NativeWebViewAndroid mixins NativeWebViewAndroidBase {}
  declare var NativeWebViewWindowsComponent: React$ComponentType<WindowsNativeWebViewProps>;
  declare var NativeWebViewWindowsBase: Constructor<NativeMethodsMixin> &
    typeof NativeWebViewWindowsComponent;
  declare export class NativeWebViewWindows mixins NativeWebViewWindowsBase {}
  declare export type ContentInsetProp = {|
    top?: number,
    left?: number,
    bottom?: number,
    right?: number,
  |};
  declare export type WebViewNativeEvent = {|
    url: string,
    loading: boolean,
    title: string,
    canGoBack: boolean,
    canGoForward: boolean,
    lockIdentifier: number,
  |};
  declare export type WebViewNativeProgressEvent = {|
    ...$Exact<WebViewNativeEvent>,

    progress: number,
  |};
  declare export type WebViewNavigation = {|
    ...$Exact<WebViewNativeEvent>,

    navigationType: 'click' | 'formsubmit' | 'backforward' | 'reload' | 'formresubmit' | 'other',
    mainDocumentURL?: string,
  |};
  declare export type ShouldStartLoadRequest = {|
    ...$Exact<WebViewNavigation>,

    isTopFrame: boolean,
  |};
  declare export type FileDownload = {|
    downloadUrl: string,
  |};
  declare export type DecelerationRateConstant = 'normal' | 'fast';
  declare export type WebViewMessage = {|
    ...$Exact<WebViewNativeEvent>,

    data: string,
  |};
  declare export type WebViewError = {|
    ...$Exact<WebViewNativeEvent>,

    /**
     * `domain` is only used on iOS and macOS
     */
    domain?: string,
    code: number,
    description: string,
  |};
  declare export type WebViewHttpError = {|
    ...$Exact<WebViewNativeEvent>,

    description: string,
    statusCode: number,
  |};
  declare export type WebViewRenderProcessGoneDetail = {|
    didCrash: boolean,
  |};
  declare export type WebViewEvent = NativeSyntheticEvent<WebViewNativeEvent>;
  declare export type WebViewProgressEvent = NativeSyntheticEvent<WebViewNativeProgressEvent>;
  declare export type WebViewNavigationEvent = NativeSyntheticEvent<WebViewNavigation>;
  declare export type ShouldStartLoadRequestEvent = NativeSyntheticEvent<ShouldStartLoadRequest>;
  declare export type FileDownloadEvent = NativeSyntheticEvent<FileDownload>;
  declare export type WebViewMessageEvent = NativeSyntheticEvent<WebViewMessage>;
  declare export type WebViewErrorEvent = NativeSyntheticEvent<WebViewError>;
  declare export type WebViewTerminatedEvent = NativeSyntheticEvent<WebViewNativeEvent>;
  declare export type WebViewHttpErrorEvent = NativeSyntheticEvent<WebViewHttpError>;
  declare export type WebViewRenderProcessGoneEvent = NativeSyntheticEvent<WebViewRenderProcessGoneDetail>;
  declare export type WebViewScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;
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
  declare export type OverScrollModeType = 'always' | 'content' | 'never';
  declare export type CacheMode =
    | 'LOAD_DEFAULT'
    | 'LOAD_CACHE_ONLY'
    | 'LOAD_CACHE_ELSE_NETWORK'
    | 'LOAD_NO_CACHE';
  declare export type AndroidLayerType = 'none' | 'software' | 'hardware';
  declare export type WebViewSourceUri = {|
    /**
     * The URI to load in the `WebView`. Can be a local or remote file.
     */
    uri: string,

    /**
     * The HTTP Method to use. Defaults to GET if not specified.
     * NOTE: On Android, only GET and POST are supported.
     */
    method?: string,

    /**
     * Additional HTTP headers to send with the request.
     * NOTE: On Android, this can only be used with GET requests.
     */
    headers?: Object,

    /**
     * The HTTP body to send with the request. This must be a valid
     * UTF-8 string, and will be sent exactly as specified, with no
     * additional encoding (e.g. URL-escaping or base64) applied.
     * NOTE: On Android, this can only be used with POST requests.
     */
    body?: string,
  |};
  declare export type WebViewSourceHtml = {|
    /**
     * A static HTML page to display in the WebView.
     */
    html: string,

    /**
     * The base URL to be used for any relative links in the HTML.
     */
    baseUrl?: string,
  |};
  declare export type WebViewSource = WebViewSourceUri | WebViewSourceHtml;
  declare export type ViewManager = {|
    startLoadWithResult: Function,
  |};
  declare export type WebViewNativeConfig = {|
    /**
     * The native component used to render the WebView.
     */
    component?: typeof NativeWebViewIOS | typeof NativeWebViewMacOS | typeof NativeWebViewAndroid,

    /**
     * Set props directly on the native component WebView. Enables custom props which the
     * original WebView doesn't pass through.
     */
    props?: Object,

    /**
     * Set the ViewManager to use for communication with the native side.
     * @platform ios, macos
     */
    viewManager?: ViewManager,
  |};
  declare export type OnShouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => boolean;
  declare export type CommonNativeWebViewProps = {|
    ...$Exact<ViewProps>,

    cacheEnabled?: boolean,
    incognito?: boolean,
    injectedJavaScript?: string,
    injectedJavaScriptBeforeContentLoaded?: string,
    injectedJavaScriptForMainFrameOnly?: boolean,
    injectedJavaScriptBeforeContentLoadedForMainFrameOnly?: boolean,
    javaScriptCanOpenWindowsAutomatically?: boolean,
    mediaPlaybackRequiresUserAction?: boolean,
    messagingEnabled: boolean,
    onScroll?: (event: WebViewScrollEvent) => void,
    onLoadingError: (event: WebViewErrorEvent) => void,
    onLoadingFinish: (event: WebViewNavigationEvent) => void,
    onLoadingProgress: (event: WebViewProgressEvent) => void,
    onLoadingStart: (event: WebViewNavigationEvent) => void,
    onHttpError: (event: WebViewHttpErrorEvent) => void,
    onMessage: (event: WebViewMessageEvent) => void,
    onShouldStartLoadWithRequest: (event: ShouldStartLoadRequestEvent) => void,
    showsHorizontalScrollIndicator?: boolean,
    showsVerticalScrollIndicator?: boolean,
    source: any,
    userAgent?: string,

    /**
     * Append to the existing user-agent. Overridden if `userAgent` is set.
     */
    applicationNameForUserAgent?: string,
  |};
  declare export type AndroidNativeWebViewProps = {|
    ...$Exact<CommonNativeWebViewProps>,

    cacheMode?: CacheMode,
    allowFileAccess?: boolean,
    scalesPageToFit?: boolean,
    allowFileAccessFromFileURLs?: boolean,
    allowUniversalAccessFromFileURLs?: boolean,
    androidHardwareAccelerationDisabled?: boolean,
    androidLayerType?: AndroidLayerType,
    domStorageEnabled?: boolean,
    geolocationEnabled?: boolean,
    javaScriptEnabled?: boolean,
    mixedContentMode?: 'never' | 'always' | 'compatibility',
    onContentSizeChange?: (event: WebViewEvent) => void,
    onRenderProcessGone?: (event: WebViewRenderProcessGoneEvent) => void,
    overScrollMode?: OverScrollModeType,
    saveFormDataDisabled?: boolean,
    setSupportMultipleWindows?: boolean,
    textZoom?: number,
    thirdPartyCookiesEnabled?: boolean,
    messagingModuleName?: string,
    +urlPrefixesForDefaultIntent?: string[],
  |};
  declare export type ContentInsetAdjustmentBehavior =
    | 'automatic'
    | 'scrollableAxes'
    | 'never'
    | 'always';
  declare export type ContentMode = 'recommended' | 'mobile' | 'desktop';
  declare export type IOSNativeWebViewProps = {|
    ...$Exact<CommonNativeWebViewProps>,

    allowingReadAccessToURL?: string,
    allowsBackForwardNavigationGestures?: boolean,
    allowsInlineMediaPlayback?: boolean,
    allowsLinkPreview?: boolean,
    allowFileAccessFromFileURLs?: boolean,
    allowUniversalAccessFromFileURLs?: boolean,
    automaticallyAdjustContentInsets?: boolean,
    autoManageStatusBarEnabled?: boolean,
    bounces?: boolean,
    contentInset?: ContentInsetProp,
    contentInsetAdjustmentBehavior?: ContentInsetAdjustmentBehavior,
    contentMode?: ContentMode,
    +dataDetectorTypes?: DataDetectorTypes | DataDetectorTypes[],
    decelerationRate?: number,
    directionalLockEnabled?: boolean,
    hideKeyboardAccessoryView?: boolean,
    pagingEnabled?: boolean,
    scrollEnabled?: boolean,
    useSharedProcessPool?: boolean,
    onContentProcessDidTerminate?: (event: WebViewTerminatedEvent) => void,
    injectedJavaScriptForMainFrameOnly?: boolean,
    injectedJavaScriptBeforeContentLoadedForMainFrameOnly?: boolean,
    onFileDownload?: (event: FileDownloadEvent) => void,
    limitsNavigationsToAppBoundDomains?: boolean,
  |};
  declare export type MacOSNativeWebViewProps = {|
    ...$Exact<CommonNativeWebViewProps>,

    allowingReadAccessToURL?: string,
    allowFileAccessFromFileURLs?: boolean,
    allowUniversalAccessFromFileURLs?: boolean,
    allowsBackForwardNavigationGestures?: boolean,
    allowsInlineMediaPlayback?: boolean,
    allowsLinkPreview?: boolean,
    automaticallyAdjustContentInsets?: boolean,
    bounces?: boolean,
    contentInset?: ContentInsetProp,
    contentInsetAdjustmentBehavior?: ContentInsetAdjustmentBehavior,
    directionalLockEnabled?: boolean,
    hideKeyboardAccessoryView?: boolean,
    pagingEnabled?: boolean,
    scrollEnabled?: boolean,
    useSharedProcessPool?: boolean,
    onContentProcessDidTerminate?: (event: WebViewTerminatedEvent) => void,
  |};
  declare export type WindowsNativeWebViewProps = {|
    ...$Exact<CommonNativeWebViewProps>,

    testID?: string,
  |};
  declare export type IOSWebViewProps = {|
    ...$Exact<WebViewSharedProps>,

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
     * Controls whether to adjust the scroll indicator inset for web views that are
     * placed behind a navigation bar, tab bar, or toolbar. The default value
     * is `false`. (iOS 13+)
     * @platform ios
     */
    automaticallyAdjustsScrollIndicatorInsets?: boolean,

    /**
     * This property specifies how the safe area insets are used to modify the
     * content area of the scroll view. The default value of this property is
     * "never". Available on iOS 11 and later.
     */
    contentInsetAdjustmentBehavior?: ContentInsetAdjustmentBehavior,

    /**
     * The amount by which the web view content is inset from the edges of
     * the scroll view. Defaults to {top: 0, left: 0, bottom: 0, right: 0}.
     * @platform ios
     */
    contentInset?: ContentInsetProp,

    /**
     * Defaults to `recommended`, which loads mobile content on iPhone
     * and iPad Mini but desktop content on other iPads.
     *
     * Possible values are:
     * - `'recommended'`
     * - `'mobile'`
     * - `'desktop'`
     * @platform ios
     */
    contentMode?: ContentMode,

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
     * @platform ios
     */
    +dataDetectorTypes?: DataDetectorTypes | DataDetectorTypes[],

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
     * Set true if StatusBar should be light when user watch video fullscreen.
     * The default value is `true`.
     * @platform ios
     */
    autoManageStatusBarEnabled?: boolean,

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
     * Boolean that sets whether JavaScript running in the context of a file
     * scheme URL should be allowed to access content from other file scheme URLs.
     * Including accessing content from other file scheme URLs
     * @platform ios
     */
    allowFileAccessFromFileURLs?: boolean,

    /**
     * Boolean that sets whether JavaScript running in the context of a file
     * scheme URL should be allowed to access content from any origin.
     * Including accessing content from other file scheme URLs
     * @platform ios
     */
    allowUniversalAccessFromFileURLs?: boolean,

    /**
     * Function that is invoked when the WebKit WebView content process gets terminated.
     * @platform ios
     */
    onContentProcessDidTerminate?: (event: WebViewTerminatedEvent) => void,

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
     * Boolean value that determines whether a pull to refresh gesture is
     * available in the `WebView`. The default value is `false`.
     * If `true`, sets `bounces` automatically to `true`
     * @platform ios
     */
    pullToRefreshEnabled?: boolean,

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

    /**
     * A Boolean value which, when set to `true`, indicates to WebKit that a WKWebView
     * will only navigate to app-bound domains. Once set, any attempt to navigate away
     * from an app-bound domain will fail with the error “App-bound domain failure.”
     *
     * Applications can specify up to 10 “app-bound” domains using a new
     * Info.plist key `WKAppBoundDomains`.
     * @platform ios
     */
    limitsNavigationsToAppBoundDomains?: boolean,

    /**
     * [object Object],[object Object],[object Object]
     * @example     window.webkit.messageHandlers.ReactNativeWebView.postMessage("hello apple pay")
     * @platform ios
     * The default value is false.
     */
    enableApplePay?: boolean,
  |};
  declare export type MacOSWebViewProps = {|
    ...$Exact<WebViewSharedProps>,

    /**
     * Does not store any data within the lifetime of the WebView.
     */
    incognito?: boolean,

    /**
     * Boolean value that determines whether the web view bounces
     * when it reaches the edge of the content. The default value is `true`.
     * @platform macos
     */
    bounces?: boolean,

    /**
     * Boolean value that determines whether scrolling is enabled in the
     * `WebView`. The default value is `true`.
     * @platform macos
     */
    scrollEnabled?: boolean,

    /**
     * If the value of this property is true, the scroll view stops on multiples
     * of the scroll view’s bounds when the user scrolls.
     * The default value is false.
     * @platform macos
     */
    pagingEnabled?: boolean,

    /**
     * Controls whether to adjust the content inset for web views that are
     * placed behind a navigation bar, tab bar, or toolbar. The default value
     * is `true`.
     * @platform macos
     */
    automaticallyAdjustContentInsets?: boolean,

    /**
     * This property specifies how the safe area insets are used to modify the
     * content area of the scroll view. The default value of this property is
     * "never". Available on iOS 11 and later.
     */
    contentInsetAdjustmentBehavior?: ContentInsetAdjustmentBehavior,

    /**
     * The amount by which the web view content is inset from the edges of
     * the scroll view. Defaults to {top: 0, left: 0, bottom: 0, right: 0}.
     * @platform macos
     */
    contentInset?: ContentInsetProp,

    /**
     * Boolean that determines whether HTML5 videos play inline or use the
     * native full-screen controller. The default value is `false`.
     *
     * **NOTE** : In order for video to play inline, not only does this
     * property need to be set to `true`, but the video element in the HTML
     * document must also include the `webkit-playsinline` attribute.
     * @platform macos
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
     * @platform macos
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
     * This property is available on devices that support Force Touch trackpad.
     * @platform macos
     */
    allowsLinkPreview?: boolean,

    /**
     * Set true if shared cookies from HTTPCookieStorage should used for every load request.
     * The default value is `false`.
     * @platform macos
     */
    sharedCookiesEnabled?: boolean,

    /**
     * A Boolean value that determines whether scrolling is disabled in a particular direction.
     * The default value is `true`.
     * @platform macos
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
     * @platform macos
     */
    keyboardDisplayRequiresUserAction?: boolean,

    /**
     * A String value that indicates which URLs the WebView's file can then
     * reference in scripts, AJAX requests, and CSS imports. This is only used
     * for WebViews that are loaded with a source.uri set to a `'file://'` URL.
     *
     * If not provided, the default is to only allow read access to the URL
     * provided in source.uri itself.
     * @platform macos
     */
    allowingReadAccessToURL?: string,

    /**
     * Boolean that sets whether JavaScript running in the context of a file
     * scheme URL should be allowed to access content from other file scheme URLs.
     * Including accessing content from other file scheme URLs
     * @platform macos
     */
    allowFileAccessFromFileURLs?: boolean,

    /**
     * Boolean that sets whether JavaScript running in the context of a file
     * scheme URL should be allowed to access content from any origin.
     * Including accessing content from other file scheme URLs
     * @platform macos
     */
    allowUniversalAccessFromFileURLs?: boolean,

    /**
     * Function that is invoked when the WebKit WebView content process gets terminated.
     * @platform macos
     */
    onContentProcessDidTerminate?: (event: WebViewTerminatedEvent) => void,
  |};
  declare export type AndroidWebViewProps = {|
    ...$Exact<WebViewSharedProps>,

    onNavigationStateChange?: (event: WebViewNavigation) => void,
    onContentSizeChange?: (event: WebViewEvent) => void,

    /**
     * Function that is invoked when the `WebView` process crashes or is killed by the OS.
     * Works only on Android (minimum API level 26).
     */
    onRenderProcessGone?: (event: WebViewRenderProcessGoneEvent) => void,

    /**
     * https://developer.android.com/reference/android/webkit/WebSettings.html#setCacheMode(int)
     * Set the cacheMode. Possible values are:
     *
     * - `'LOAD_DEFAULT'` (default)
     * - `'LOAD_CACHE_ELSE_NETWORK'`
     * - `'LOAD_NO_CACHE'`
     * - `'LOAD_CACHE_ONLY'`
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
     * Boolean value to set whether the WebView supports multiple windows. Used on Android only
     * The default value is `true`.
     * @platform android
     */
    setSupportMultipleWindows?: boolean,

    /**
     * [object Object],[object Object],[object Object]
     * @platform android
     */
    +urlPrefixesForDefaultIntent?: string[],

    /**
     * Boolean value to disable Hardware Acceleration in the `WebView`. Used on Android only
     * as Hardware Acceleration is a feature only for Android. The default value is `false`.
     * @platform android
     */
    androidHardwareAccelerationDisabled?: boolean,

    /**
     * https://developer.android.com/reference/android/webkit/WebView#setLayerType(int,%20android.graphics.Paint)
     * Sets the layerType. Possible values are:
     *
     * - `'none'` (default)
     * - `'software'`
     * - `'hardware'`
     * @platform android
     */
    androidLayerType?: AndroidLayerType,

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
    mixedContentMode?: 'never' | 'always' | 'compatibility',

    /**
     * Sets ability to open fullscreen videos on Android devices.
     */
    allowsFullscreenVideo?: boolean,
  |};
  declare export type WebViewSharedProps = {|
    ...$Exact<ViewProps>,

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
     * A Boolean value indicating whether JavaScript can open windows without user interaction.
     * The default value is `false`.
     */
    javaScriptCanOpenWindowsAutomatically?: boolean,

    /**
     * Stylesheet object to set the style of the container view.
     */
    containerStyle?: StyleProp<ViewStyle>,

    /**
     * Function that returns a view to show if there's an error.
     */
    renderError?: (
      errorDomain: string | void,
      errorCode: number,
      errorDesc: string,
    ) => React$Element<React$ElementType>,

    /**
     * Function that returns a loading indicator.
     */
    renderLoading?: () => React$Element<React$ElementType>,

    /**
     * Function that is invoked when the `WebView` scrolls.
     */
    onScroll?: (event: WebViewScrollEvent) => void,

    /**
     * Function that is invoked when the `WebView` has finished loading.
     */
    onLoad?: (event: WebViewNavigationEvent) => void,

    /**
     * Function that is invoked when the `WebView` load succeeds or fails.
     */
    onLoadEnd?: (event: WebViewNavigationEvent | WebViewErrorEvent) => void,

    /**
     * Function that is invoked when the `WebView` starts loading.
     */
    onLoadStart?: (event: WebViewNavigationEvent) => void,

    /**
     * Function that is invoked when the `WebView` load fails.
     */
    onError?: (event: WebViewErrorEvent) => void,

    /**
     * Function that is invoked when the `WebView` receives an error status code.
     * Works on iOS and Android (minimum API level 23).
     */
    onHttpError?: (event: WebViewHttpErrorEvent) => void,

    /**
     * Function that is invoked when the `WebView` loading starts or ends.
     */
    onNavigationStateChange?: (event: WebViewNavigation) => void,

    /**
     * Function that is invoked when the webview calls `window.ReactNativeWebView.postMessage`.
     * Setting this property will inject this global into your webview.
     *
     * `window.ReactNativeWebView.postMessage` accepts one argument, `data`, which will be
     * available on the event object, `event.nativeEvent.data`. `data` must be a string.
     */
    onMessage?: (event: WebViewMessageEvent) => void,

    /**
     * Function that is invoked when the `WebView` is loading.
     */
    onLoadProgress?: (event: WebViewProgressEvent) => void,

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
     * If `true` (default; mandatory for Android), loads the `injectedJavaScript` only into the main frame.
     * If `false` (only supported on iOS and macOS), loads it into all frames (e.g. iframes).
     */
    injectedJavaScriptForMainFrameOnly?: boolean,

    /**
     * If `true` (default; mandatory for Android), loads the `injectedJavaScriptBeforeContentLoaded` only into the main frame.
     * If `false` (only supported on iOS and macOS), loads it into all frames (e.g. iframes).
     */
    injectedJavaScriptBeforeContentLoadedForMainFrameOnly?: boolean,

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
    +originWhitelist?: string[],

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

    /**
     * Append to the existing user-agent. Overridden if `userAgent` is set.
     */
    applicationNameForUserAgent?: string,
  |};

  //
  // node_modules/react-native-webview/lib/WebView.d.ts
  //

  // A fudge: iOS will have IOSWebViewProps; Android will have
  // AndroidWebViewProps. Hard to get Flow to check platform-specific
  // codepaths separately.
  declare export type WebViewProps = $ReadOnly<{| ...IOSWebViewProps, ...AndroidWebViewProps |}>;

  // Incomplete; see methods at
  //   https://github.com/react-native-webview/react-native-webview/blob/5e73b2089/docs/Reference.md#methods-index
  // Some differ between platforms.
  declare export var WebView: React$ComponentType<WebViewProps>;

  declare export default typeof WebView;
}
