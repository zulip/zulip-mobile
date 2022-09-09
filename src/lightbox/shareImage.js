/* @flow strict-local */
import { Platform, Share } from 'react-native';

import { downloadImage, downloadFileToCache } from './download';
import type { Auth } from '../types';
import ShareFileAndroid from '../nativeModules/ShareFileAndroid';
import { showToast } from '../utils/info';
import * as api from '../api';
import { openLinkEmbedded } from '../utils/openLink';
import * as logging from '../utils/logging';

// TODO(i18n): Wire up toasts for translation.
export default async (url: string, auth: Auth) => {
  const tempUrl = await api.tryGetFileTemporaryUrl(url, auth);

  if (tempUrl === null) {
    // Open the file in a browser and invite the user to use the browser's
    // "share" feature. That's probably not what they expected when they hit
    // "share"… and when the browser opens, it's probably not always clear
    // what that has to do with the share they wanted to do.
    //
    // So we're giving them some kind of indication of "yes, we heard you,
    // you want to share the file -- this is the path we're offering for
    // doing that".
    //
    // TODO(?): Could find a better way to convey this.
    showToast('Please share the image from your browser');
    openLinkEmbedded(new URL(url, auth.realm).toString());
    return;
  }

  const fileName = url.split('/').pop();
  if (Platform.OS === 'android') {
    try {
      const res: $FlowFixMe = await downloadFileToCache(tempUrl.toString(), fileName);
      await ShareFileAndroid.shareFile(res.path());
    } catch (error) {
      showToast('Share failed');
      logging.error(error);
    }
  } else {
    try {
      const uri = await downloadImage(tempUrl.toString(), fileName, auth);
      await Share.share({ url: uri, message: url });
    } catch (error) {
      showToast('Share failed');
      logging.error(error);
    }
  }
};
