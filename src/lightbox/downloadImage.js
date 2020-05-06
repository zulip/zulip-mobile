/* @flow strict-local */
import { CameraRoll, Platform, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import type { Auth } from '../api/transportTypes';
import { getAuthHeaders } from '../api/transport';
import { getFullUrl } from '../utils/url';
import userAgent from '../utils/userAgent';

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

export default async (src: string, auth: Auth): Promise<mixed> => {
  const absoluteUrl = getFullUrl(src, auth.realm);

  if (Platform.OS === 'ios') {
    const delimiter = absoluteUrl.includes('?') ? '&' : '?';
    const urlWithApiKey = `${absoluteUrl}${delimiter}api_key=${auth.apiKey}`;
    return CameraRoll.saveToCameraRoll(urlWithApiKey);
  }

  // Platform.OS === 'android'
  await androidEnsureStoragePermission();
  return RNFetchBlob.config({
    addAndroidDownloads: {
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/${src.split('/').pop()}`,
      useDownloadManager: true,
      mime: 'text/plain', // Android DownloadManager fails if the url is missing a file extension
      title: src.split('/').pop(),
      notification: true,
    },
  }).fetch('GET', absoluteUrl, {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'User-Agent': userAgent,
    ...getAuthHeaders(auth),
  });
};
