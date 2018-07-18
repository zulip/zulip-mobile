/* @flow */
import RNFetchBlob from 'react-native-fetch-blob';

import type { Auth } from './apiTypes';
import { getAuthHeader, getFullUrl } from '../utils/url';
import userAgent from '../utils/userAgent';

export default (src: string, auth: Auth) =>
  RNFetchBlob.config({
    addAndroidDownloads: {
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/${src.split('/').pop()}`,
      useDownloadManager: true,
      mime: 'text/plain', // Android DownloadManager fails if the url is missing a file extension
      title: src.split('/').pop(),
    },
  }).fetch('GET', getFullUrl(src, auth.realm), {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'User-Agent': userAgent,
    Authorization: getAuthHeader(auth.email, auth.apiKey),
  });
