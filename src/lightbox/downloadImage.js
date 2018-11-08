/* @flow */
import { CameraRoll, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import type { Auth } from '../api/apiTypes';
import { getAuthHeader, getFullUrl } from '../utils/url';
import userAgent from '../utils/userAgent';

export default (src: string, auth: Auth) => {
  const absoluteUrl = getFullUrl(src, auth.realm);

  if (Platform.OS === 'ios') {
    const delimiter = absoluteUrl.includes('?') ? '&' : '?';
    const urlWithApiKey = `${absoluteUrl}${delimiter}api_key=${auth.apiKey}`;
    return CameraRoll.saveToCameraRoll(urlWithApiKey);
  }
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
    Authorization: getAuthHeader(auth.email, auth.apiKey),
  });
};
