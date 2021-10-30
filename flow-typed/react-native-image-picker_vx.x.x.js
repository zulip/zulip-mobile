// Added by translating from TS using Flowgen 1.14.1 with
//   --interface-records --no-inexact
// and tweaking manually.

// node_modules/react-native-image-picker/src/types.ts
declare module 'react-native-image-picker/types' {
  declare export type Callback = (response: ImagePickerResponse) => mixed;
  declare export type ImageLibraryOptions = {|
    selectionLimit?: number,
    mediaType: MediaType,
    maxWidth?: number,
    maxHeight?: number,
    quality?: PhotoQuality,
    videoQuality?: AndroidVideoOptions | iOSVideoOptions,
    includeBase64?: boolean,
  |};
  declare export type CameraOptions = {|
    ...$ReadOnly<$Diff<ImageLibraryOptions, {| selectionLimit: mixed |}>>,

    durationLimit?: number,
    saveToPhotos?: boolean,
    cameraType?: CameraType,
  |};
  declare export type Asset = {|
    base64?: string,
    uri?: string,
    width?: number,
    height?: number,
    fileSize?: number,
    type?: string,
    fileName?: string,
    duration?: number,
  |};
  declare export type ImagePickerResponse = {|
    didCancel?: boolean,
    errorCode?: ErrorCode,
    errorMessage?: string,
    assets?: Asset[],
  |};
  declare export type PhotoQuality = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
  declare export type CameraType = 'back' | 'front';
  declare export type MediaType = 'photo' | 'video' | 'mixed';
  declare export type AndroidVideoOptions = 'low' | 'high';
  declare export type iOSVideoOptions = 'low' | 'medium' | 'high';
  declare export type ErrorCode = 'camera_unavailable' | 'permission' | 'others';
}

// node_modules/react-native-image-picker/src/index.ts
declare module 'react-native-image-picker' {
  import type {
    CameraOptions,
    ImageLibraryOptions,
    Callback,
  } from 'react-native-image-picker/types';

  declare export * from 'react-native-image-picker/types'

  declare var DEFAULT_OPTIONS: { ...ImageLibraryOptions, ...CameraOptions };
  declare export function launchCamera(options: CameraOptions, callback: Callback): void;
  declare export function launchImageLibrary(
    options: ImageLibraryOptions,
    callback: Callback,
  ): void;
}
