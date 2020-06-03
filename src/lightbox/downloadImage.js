/* @flow strict-local */
import { CameraRoll, Platform, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import type { Auth } from '../api/transportTypes';

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
  //   https://facebook.github.io/react-native/docs/permissionsandroid
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
 *     using `getTemporaryFileUrl`.
 * @param auth Authentication info for the current user.
 */
export default async (url: string, auth: Auth): Promise<mixed> => {
  if (Platform.OS === 'ios') {
    return CameraRoll.saveToCameraRoll(url);
  }

  // Platform.OS === 'android'
  await androidEnsureStoragePermission();
  return RNFetchBlob.config({
    addAndroidDownloads: {
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/${url.split('/').pop()}`,
      useDownloadManager: true,
      mime: 'text/plain', // Android DownloadManager fails if the url is missing a file extension
      title: url.split('/').pop(),
      notification: true,
    },
  }).fetch('GET', url);
};
