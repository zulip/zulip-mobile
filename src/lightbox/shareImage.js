/* @flow strict-local */
import { Platform, Share } from 'react-native';

import downloadImage from './downloadImage';
import type { Auth } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';
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
    const res: $FlowFixMe = await downloadImage(tempUrl, fileName, auth);
    await ShareImageAndroid.shareImage(res.path());
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
