/* @flow strict-local */
import { CameraRoll, Platform, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import type { Auth } from '../api/transportTypes';
import { objectToParams } from '../api/apiFetch';
import { getAuthHeader, getFullUrl } from './url';
import userAgent from './userAgent';
import { showToast } from '../utils/info';
import openLink from '../utils/openLink';

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

export const downloadImage = async (src: string, auth: Auth): Promise<mixed> => {
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
  }).fetch(
    'GET',
    absoluteUrl,
    objectToParams({
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
      Authorization: getAuthHeader(auth.email, auth.apiKey),
    }),
  );
};

export const downloadFile = async (href: string, auth: Auth) => {
  const fullUrl = getFullUrl(href, auth.realm);

  const parentDir = auth.realm.replace('https://', '').replace('http://', '');
  const fileName = fullUrl.split('/').pop();
  const { dirs } = RNFetchBlob.fs;
  let downloadDir = '';
  if (Platform.OS === 'android') {
    await androidEnsureStoragePermission();
    downloadDir = dirs.DownloadDir;
  } else {
    downloadDir = dirs.DocumentDir;
  }
  const path = `${downloadDir}/${parentDir}/${fileName}`;

  const authHeader = getAuthHeader(auth.email, auth.apiKey);
  if (authHeader === null || authHeader === undefined) {
    throw new Error('AuthHeader required');
  }

  showToast('Downloading file');

  RNFetchBlob.config({
    path,
    addAndroidDownloads: {
      notification: true,
      description: `File downloaded to ${path}`,
      mediaScannable: true,
      title: `Successfully downloaded ${fileName}`,
    },
  })
    .fetch('GET', fullUrl, {
      Authorization: authHeader,
    })
    .then(res => {
      const { status } = res.info();
      if (status === 200) {
        showToast('File successfully downloaded');
        return;
      }
      openLink(fullUrl);
      showToast('Unable to download file');
    })
    .catch((errorMessage, statusCode) => {
      openLink(fullUrl);
      showToast('Unable to download file');
    });
};
