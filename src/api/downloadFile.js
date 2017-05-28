/* @flow */
import { Platform, CameraRoll } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';

import { getAuthHeader } from '../utils/url';
import userAgent from '../utils/userAgent';
import { Auth } from '../types';

export default (url: string, auth: Auth) => {
  const fileName = url.split('/').pop();
  const extension = fileName.split('.').pop();

  let dirs = RNFetchBlob.fs.dirs; // eslint-disable-line
  if (Platform.OS === 'android') {
    return RNFetchBlob.config({
      fileCache: true,
      appendExt: extension,
      path: `${dirs.DownloadDir}/${fileName}`,
      addAndroidDownloads: {
        useDownloadManager: true,
        // Optional, but recommended since android DownloadManager will fail when
        // the url does not contains a file extension, by default the mime type will be text/plain
        mime: 'text/plain',
        title: fileName,
      },
    }).fetch('GET', url, {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'User-Agent': userAgent,
      Authorization: getAuthHeader(auth.email, auth.apiKey),
    });
  } else {
    return CameraRoll.saveToCameraRoll(url);
  }
};
