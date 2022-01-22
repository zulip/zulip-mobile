// Assembled with help from Flowgen v1.10.0.
//
// The modules 'expo-screen-orientation/build/ScreenOrientation' and
// 'expo-screen-orientation/build/ScreenOrientation.types' are the
// result of passing those files in node_modules through Flowgen and
// doing some minor syntactic tweaks.

declare module 'expo-screen-orientation/build/ScreenOrientation' {
  // We can't import Subscription; see
  // https://github.com/flow-typed/flow-typed/blob/master/CONTRIBUTING.md#dont-import-types-from-other-libdefs
  //
  // So, copy it here (it's small).
  // https://github.com/expo/expo/blob/master/packages/%40unimodules/react-native-adapter/src/EventEmitter.ts#L13-L15
  declare export type Subscription = {|
    remove: () => void,
  |};

  import typeof {
    Orientation,
    OrientationLock,
    SizeClassIOS,
    WebOrientation,
    WebOrientationLock,
  } from 'expo-screen-orientation/build/ScreenOrientation.types';
  import type {
    OrientationChangeEvent,
    OrientationChangeListener,
    PlatformOrientationInfo,
    ScreenOrientationInfo,
  } from 'expo-screen-orientation/build/ScreenOrientation.types';

  /**
   * Lock the screen orientation to a particular `OrientationLock`.
   * @param orientationLock The orientation lock to apply. See the
   *   [`OrientationLock`](#screenorientationorientationlock) enum for
   *   possible values.
   * @return Returns a promise with `void` value, which fulfils when the
   *   orientation is set.
   *
   * # Error codes
   * - `ERR_SCREEN_ORIENTATION_INVALID_ORIENTATION_LOCK` - An invalid
   *   [`OrientationLock`](#screenorientationorientationlock) was passed in.
   * - `ERR_SCREEN_ORIENTATION_UNSUPPORTED_ORIENTATION_LOCK` - The platform
   *   does not support the orientation lock policy.
   * - `ERR_SCREEN_ORIENTATION_MISSING_ACTIVITY` - __Android Only.__ Could
   *   not get the current activity.
   *
   * # Example
   * ```ts
   * async function changeScreenOrientation() {
   *   await ScreenOrientation.lockAsync(
   *     ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
   *   );
   * }
   * ```
   */
  declare export function lockAsync(orientationLock: OrientationLock): Promise<void>;

  /**
   * @param options The platform specific lock to apply. See the
   *   [`PlatformOrientationInfo`](#screenorientationplatformorientationinfo)
   *   object type for the different platform formats.
   * @return Returns a promise with `void` value, resolving when the
   *   orientation is set and rejecting if an invalid option or value is
   *   passed.
   *
   * # Error codes
   * - `ERR_SCREEN_ORIENTATION_INVALID_ORIENTATION_LOCK` - __iOS Only.__ An
   *   invalid [`OrientationLock`](#screenorientationorientationlock) was
   *   passed in.
   * - `ERR_SCREEN_ORIENTATION_UNSUPPORTED_ORIENTATION_LOCK` - The platform
   *   does not support the orientation lock policy.
   * - `ERR_SCREEN_ORIENTATION_MISSING_ACTIVITY` - __Android Only.__ Could
   *   not get the current activity.
   */
  declare export function lockPlatformAsync(options: PlatformOrientationInfo): Promise<void>;

  /**
   * Sets the screen orientation back to the `OrientationLock.DEFAULT`
   *   policy.
   * @return Returns a promise with `void` value, which fulfils when the
   *   orientation is set.
   *
   * # Error codes
   * - `ERR_SCREEN_ORIENTATION_MISSING_ACTIVITY` - __Android Only.__ Could
   *   not get the current activity.
   */
  declare export function unlockAsync(): Promise<void>;

  /**
   * Gets the current screen orientation.
   * @return Returns a promise that fulfils with an
   *   [`Orientation`](#screenorientationorientation) value that reflects
   *   the current screen orientation.
   *
   * # Error codes
   * - `ERR_SCREEN_ORIENTATION_GET_ORIENTATION_LOCK` - __Android Only.__ An
   *   unknown error occurred when trying to get the system lock.
   * - `ERR_SCREEN_ORIENTATION_MISSING_ACTIVITY` - __Android Only.__ Could
   *   not get the current activity.
   */
  declare export function getOrientationAsync(): Promise<Orientation>;

  /**
   * Gets the current screen orientation lock type.
   * @return Returns a promise which fulfils with an
   *   [`OrientationLock`](#screenorientationorientationlock) value.
   *
   * # Error codes
   * - `ERR_SCREEN_ORIENTATION_MISSING_ACTIVITY` - __Android Only.__ Could
   *   not get the current activity.
   */
  declare export function getOrientationLockAsync(): Promise<OrientationLock>;

  /**
   * Gets the platform specific screen orientation lock type.
   * @return Returns a promise which fulfils with a
   *   [`PlatformOrientationInfo`](#screenorientationplatformorientationinfo)
   *   value.
   *
   * # Error codes
   * - `ERR_SCREEN_ORIENTATION_GET_PLATFORM_ORIENTATION_LOCK`
   * - `ERR_SCREEN_ORIENTATION_MISSING_ACTIVITY` - __Android Only.__ Could
   *   not get the current activity.
   */
  declare export function getPlatformOrientationLockAsync(): Promise<PlatformOrientationInfo>;

  /**
   * Returns whether the
   *   [`OrientationLock`](#screenorientationorientationlock) policy is
   *   supported on the device.
   * @param orientationLock
   * @return Returns a promise that resolves to a `boolean` value that
   *   reflects whether or not the orientationLock is supported.
   */
  declare export function supportsOrientationLockAsync(
    orientationLock: OrientationLock,
  ): Promise<boolean>;

  /**
   * Invokes the `listener` function when the screen orientation changes
   *   from `portrait` to `landscape` or from `landscape` to `portrait`. For
   *   example, it won't be invoked when screen orientation change from
   *   `portrait up` to `portrait down`, but it will be called when there
   *   was a change from `portrait up` to `landscape left`.
   * @param listener Each orientation update will pass an object with the
   *   new
   *   [`OrientationChangeEvent`](#screenorientationorientationchangeevent)
   *   to the listener.
   */
  declare export function addOrientationChangeListener(
    listener: OrientationChangeListener,
  ): Subscription;

  /**
   * Removes all listeners subscribed to orientation change updates.
   */
  declare export function removeOrientationChangeListeners(): void;

  /**
   * Unsubscribes the listener associated with the `Subscription` object
   *   from all orientation change updates.
   * @param subscription A subscription object that manages the updates
   *   passed to a listener function on an orientation change.
   */
  declare export function removeOrientationChangeListener(subscription: Subscription): void;
}

declare module 'expo-screen-orientation/build/ScreenOrientation.types' {
  declare export var Orientation: {|
    /**
     * An unknown screen orientation. For example, the device is flat,
     *   perhaps on a table.
     */
    +UNKNOWN: 0, // 0

    /**
     * Right-side up portrait interface orientation.
     */
    +PORTRAIT_UP: 1, // 1

    /**
     * Upside down portrait interface orientation.
     */
    +PORTRAIT_DOWN: 2, // 2

    /**
     * Left landscape interface orientation.
     */
    +LANDSCAPE_LEFT: 3, // 3

    /**
     * Right landscape interface orientation.
     */
    +LANDSCAPE_RIGHT: 4, // 4
  |};

/**
 * An enum whose values can be passed to the
 *   [`lockAsync`](#screenorientationlockasyncorientationlock) method.
 *
 * > __Note:__ `OrientationLock.ALL` and `OrientationLock.PORTRAIT` are
 *   invalid on devices which don't support `OrientationLock.PORTRAIT_DOWN`.
 */
  declare export var OrientationLock: {|
    /**
     * The default orientation. On iOS, this will allow all orientations
     *   except `Orientation.PORTRAIT_DOWN`. On Android, this lets the
     *   system decide the best orientation.
     */
    +DEFAULT: 0, // 0

    /**
     * All four possible orientations
     */
    +ALL: 1, // 1

    /**
     * Any portrait orientation.
     */
    +PORTRAIT: 2, // 2

    /**
     * Right-side up portrait only.
     */
    +PORTRAIT_UP: 3, // 3

    /**
     * Upside down portrait only.
     */
    +PORTRAIT_DOWN: 4, // 4

    /**
     * Any landscape orientation.
     */
    +LANDSCAPE: 5, // 5

    /**
     * Left landscape only.
     */
    +LANDSCAPE_LEFT: 6, // 6

    /**
     * Right landscape only.
     */
    +LANDSCAPE_RIGHT: 7, // 7

    /**
     * A platform specific orientation. This is not a valid policy that can
     *   be applied in
     *   [`lockAsync`](#screenorientationlockasyncorientationlock).
     */
    +OTHER: 8, // 8

    /**
     * An unknown screen orientation lock. This is not a valid policy that
     *   can be applied in
     *   [`lockAsync`](#screenorientationlockasyncorientationlock).
     */
    +UNKNOWN: 9, // 9
  |};

/**
 * Each iOS device has a default set of [size
 *   classes](https://developer.apple.com/library/archive/featuredarticles/ViewControllerPGforiPhoneOS/TheAdaptiveModel.html)
 *   that you can use as a guide when designing your interface.
 */
  declare export var SizeClassIOS: {|
    +REGULAR: 0, // 0
    +COMPACT: 1, // 1
    +UNKNOWN: 2, // 2
  |};

  /**
   * An enum representing the lock policies that can be applied on the web
   *   platform, modelled after the [W3C
   *   specification](https://w3c.github.io/screen-orientation/#dom-orientationlocktype).
   *   These values can be applied through the
   *   [`lockPlatformAsync`](#screenorientationlockplatformasyncplatforminfo)
   *   method.
   */
  declare export var WebOrientationLock: {|
    +PORTRAIT_PRIMARY: 'portrait-primary', // "portrait-primary"
    +PORTRAIT_SECONDARY: 'portrait-secondary', // "portrait-secondary"
    +PORTRAIT: 'portrait', // "portrait"
    +LANDSCAPE_PRIMARY: 'landscape-primary', // "landscape-primary"
    +LANDSCAPE_SECONDARY: 'landscape-secondary', // "landscape-secondary"
    +LANDSCAPE: 'landscape', // "landscape"
    +ANY: 'any', // "any"
    +NATURAL: 'natural', // "natural"
    +UNKNOWN: 'unknown', // "unknown"
  |};

  declare export var WebOrientation: {|
    +PORTRAIT_PRIMARY: 'portrait-primary', // "portrait-primary"
    +PORTRAIT_SECONDARY: 'portrait-secondary', // "portrait-secondary"
    +LANDSCAPE_PRIMARY: 'landscape-primary', // "landscape-primary"
    +LANDSCAPE_SECONDARY: 'landscape-secondary', // "landscape-secondary"
  |};
  declare export type PlatformOrientationInfo = {
    /**
     * __Android Only.__ A constant to set using the Android native
     *   [API](https://developer.android.com/reference/android/R.attr.html#screenOrientation).
     *   For example, in order to set the lock policy to
     *   [unspecified](https://developer.android.com/reference/android/content/pm/ActivityInfo.html#SCREEN_ORIENTATION_UNSPECIFIED),
     *   `-1` should be passed in.
     */
    screenOrientationConstantAndroid?: number,

    /**
     * __iOS Only.__ An array of orientations to allow on the iOS platform.
     */
    screenOrientationArrayIOS?: $Values<typeof Orientation>[],

    /**
     * __Web Only.__ A web orientation lock to apply in the browser.
     */
    screenOrientationLockWeb?: $Values<typeof WebOrientationLock>,

    ...
  };
  declare export type ScreenOrientationInfo = {
    /**
     * The current orientation of the device.
     */
    orientation: $Values<typeof Orientation>,

    /**
     *  __iOS Only.__ The [vertical size
     *   class](https://developer.apple.com/library/archive/featuredarticles/ViewControllerPGforiPhoneOS/TheAdaptiveModel.html)
     *   of the device.
     */
    verticalSizeClass?: $Values<typeof SizeClassIOS>,

    /**
     *  __iOS Only.__ The [horizontal size
     *   class](https://developer.apple.com/library/archive/featuredarticles/ViewControllerPGforiPhoneOS/TheAdaptiveModel.html)
     *   of the device.
     */
    horizontalSizeClass?: $Values<typeof SizeClassIOS>,

    ...
  };
  declare export type OrientationChangeListener = (event: OrientationChangeEvent) => void;
  declare export type OrientationChangeEvent = {
    /**
     * The current `OrientationLock` of the device.
     */
    orientationLock: $Values<typeof OrientationLock>,

    /**
     * The current `ScreenOrientationInfo` of the device.
     */
    orientationInfo: ScreenOrientationInfo,
    ...
  };
}

declare module 'expo-screen-orientation' {
  declare export * from 'expo-screen-orientation/build/ScreenOrientation'
  declare export * from 'expo-screen-orientation/build/ScreenOrientation.types'
}
