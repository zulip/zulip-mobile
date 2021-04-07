/* @flow strict-local */
import { Platform, Share } from 'react-native';

import { downloadImage, downloadFileToCache } from './download';
import type { Auth } from '../types';
import ShareFileAndroid from '../nativeModules/ShareFileAndroid';
import { showToast } from '../utils/info';
import * as api from '../api';
import openLink from '../utils/openLink';

export default async (url: string, auth: Auth) => {
  const tempUrl = await api.tryGetFileTemporaryUrl(url, auth);

  if (tempUrl === null) {
    showToast('Please share the image from your browser');
    openLink(new URL(url, auth.realm).toString());
    return;
  }

  const fileName = url.split('/').pop();
  if (Platform.OS === 'android') {
    try {
      const res: $FlowFixMe = await downloadFileToCache(tempUrl, fileName);
      await ShareFileAndroid.shareFile(res.path());
    } catch (error) {
      showToast('Sharing Failed.');
    }
  } else {
    try {
      const uri = await downloadImage(tempUrl, fileName, auth);
      try {
        await Share.share({ url: uri, message: url });
      } catch (error) {
        showToast('Can not share');
      }
    } catch (error) {
      showToast('Can not download');
    }
  }
};
