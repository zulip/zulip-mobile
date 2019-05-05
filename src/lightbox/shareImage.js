/* @flow strict-local */
import { Platform, Share } from 'react-native';

import downloadImage from './downloadImage';
import type { Auth } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';
import { showToast } from '../utils/info';

export default async (url: string, auth: Auth) => {
  if (Platform.OS === 'android') {
    const res: $FlowFixMe = await downloadImage(url, auth);
    await ShareImageAndroid.shareImage(res.path());
  } else {
    try {
      const uri = await downloadImage(url, auth);
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
