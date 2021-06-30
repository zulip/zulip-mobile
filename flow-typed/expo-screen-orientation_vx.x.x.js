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
  declare type Subscription = {|
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

  declare export function lockAsync(orientationLock: OrientationLock): Promise<void>;
  declare export function lockPlatformAsync(options: PlatformOrientationInfo): Promise<void>;
  declare export function unlockAsync(): Promise<void>;
  declare export function getOrientationAsync(): Promise<Orientation>;
  declare export function getOrientationLockAsync(): Promise<OrientationLock>;
  declare export function getPlatformOrientationLockAsync(): Promise<PlatformOrientationInfo>;
  declare export function supportsOrientationLockAsync(
    orientationLock: OrientationLock,
  ): Promise<boolean>;
  declare export function addOrientationChangeListener(
    listener: OrientationChangeListener,
  ): Subscription;
  declare export function removeOrientationChangeListeners(): void;
  declare export function removeOrientationChangeListener(subscription: Subscription): void;
}

declare module 'expo-screen-orientation/build/ScreenOrientation.types' {
  declare export var Orientation: {|
    +UNKNOWN: 0, // 0
    +PORTRAIT_UP: 1, // 1
    +PORTRAIT_DOWN: 2, // 2
    +LANDSCAPE_LEFT: 3, // 3
    +LANDSCAPE_RIGHT: 4, // 4
  |};

  declare export var OrientationLock: {|
    +DEFAULT: 0, // 0
    +ALL: 1, // 1
    +PORTRAIT: 2, // 2
    +PORTRAIT_UP: 3, // 3
    +PORTRAIT_DOWN: 4, // 4
    +LANDSCAPE: 5, // 5
    +LANDSCAPE_LEFT: 6, // 6
    +LANDSCAPE_RIGHT: 7, // 7
    +OTHER: 8, // 8
    +UNKNOWN: 9, // 9
  |};

  declare export var SizeClassIOS: {|
    +REGULAR: 0, // 0
    +COMPACT: 1, // 1
    +UNKNOWN: 2, // 2
  |};

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
    screenOrientationConstantAndroid?: number,
    screenOrientationArrayIOS?: $Values<typeof Orientation>[],
    screenOrientationLockWeb?: $Values<typeof WebOrientationLock>,
    ...
  };
  declare export type ScreenOrientationInfo = {
    orientation: $Values<typeof Orientation>,
    verticalSizeClass?: $Values<typeof SizeClassIOS>,
    horizontalSizeClass?: $Values<typeof SizeClassIOS>,
    ...
  };
  declare export type OrientationChangeListener = (event: OrientationChangeEvent) => void;
  declare export type OrientationChangeEvent = {
    orientationLock: $Values<typeof OrientationLock>,
    orientationInfo: ScreenOrientationInfo,
    ...
  };
}

declare module 'expo-screen-orientation' {
  declare export * from 'expo-screen-orientation/build/ScreenOrientation'
  declare export * from 'expo-screen-orientation/build/ScreenOrientation.types'
}
