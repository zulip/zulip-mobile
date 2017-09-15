/* @flow */
import RNFetchBlob from 'react-native-fetch-blob';

import type { Auth } from '../types';
import { getAuthHeader } from '../utils/url';
import userAgent from '../utils/userAgent';

export default (url: string, auth: Auth) =>
  RNFetchBlob.config({
    addAndroidDownloads: {
      path: `${RNFetchBlob.fs.dirs.DownloadDir}/${url.split('/').pop()}`,
      useDownloadManager: true,
      // Optional, but recommended since android DownloadManager will fail when
      // the url does not contains a file extension, by default the mime type will be text/plain
      mime: 'text/plain',
      title: url.split('/').pop(),
    },
  })
    .fetch('GET', url, {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
      Authorization: getAuthHeader(auth.email, auth.apiKey),
    })
    .catch(new Error("Can't download"));
