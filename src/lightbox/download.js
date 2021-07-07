/* @flow strict-local */
import { Platform, PermissionsAndroid } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import RNFetchBlob from 'rn-fetch-blob';

import type { Auth } from '../api/transportTypes';
import { getMimeTypeFromFileExtension } from '../utils/url';

/**
 * Request permission WRITE_EXTERNAL_STORAGE, or throw if can't get it.
 *
 * The error thrown will have a `message` suitable for showing to the user
 * as a toast.
 */
const androidEnsureStoragePermission = async (): Promise<void> => {
  // See docs from Android for the underlying interaction with the user:
  //   https://developer.android.com/training/permissions/requesting
  // and from RN for the specific API that wraps it:
  //   https://reactnative.dev/docs/permissionsandroid
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const granted = await PermissionsAndroid.check(permission);
  if (granted) {
    return;
  }
  const result = await PermissionsAndroid.request(permission, {
    title: 'Storage permission needed',
    message: 'To download images, allow Zulip to store files on your device.',
  });
  const { DENIED, NEVER_ASK_AGAIN /* , GRANTED */ } = PermissionsAndroid.RESULTS;
  if (result === DENIED || result === NEVER_ASK_AGAIN) {
    throw new Error('Storage permission required');
  }
  // result === GRANTED
};

/**
 * Download a remote image to the device.
 *
 * @param url A URL to the image.  Should be a valid temporary URL generated
 *     using `getFileTemporaryUrl`.
 * @param fileName Name of the file to be downloaded. Should include the
 *     extension.
 * @param auth Authentication info for the current user.
 */
export const downloadImage = async (url: string, fileName: string, auth: Auth): Promise<mixed> => {
  if (Platform.OS === 'ios') {
    return CameraRoll.save(url);
  }

  // Platform.OS === 'android'
  const mime = getMimeTypeFromFileExtension(fileName.split('.').pop());
  await androidEnsureStoragePermission();
  return RNFetchBlob.config({
    addAndroidDownloads: {
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`,
      useDownloadManager: true,
      mime, // Android DownloadManager fails if the url is missing a file extension
      title: fileName,
      notification: true,
    },
  }).fetch('GET', url);
};

/**
 * Download a remote file to the app's cache directory.
 *
 * @param tempUrl A URL to the file. Should be a valid temporary URL generated
 *     using `getFileTemporaryUrl`.
 * @param fileName Name of the file to be downloaded. Should include the
 *     extension.
 */
export const downloadFileToCache = async (tempUrl: string, fileName: string): Promise<mixed> =>
  RNFetchBlob.config({
    path: `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`,
  }).fetch('GET', tempUrl);
