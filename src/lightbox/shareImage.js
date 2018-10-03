/* @flow */
import { Platform, Share } from 'react-native';

import downloadFile from '../api/downloadFile';
import type { Auth } from '../types';
import ShareImageAndroid from '../nativeModules/ShareImageAndroid';

import { showToast } from '../utils/info';

export default async (url: string, auth: Auth): Promise<void> => {
  if (Platform.OS === 'ios') {
    try {
      const uri = await downloadFile(url, auth);
      try {
        await Share.share({ url: uri, message: url });
      } catch (error) {
        showToast('Can not share');
      }
    } catch (error) {
      showToast('Can not download');
    }
  } else {
    await downloadFile(url, auth).then((res: Object) => ShareImageAndroid.shareImage(res.path()));
  }
};
