/* @flow */
import { Share } from 'react-native';

import type { Auth } from '../types';
import download from '../api/downloadFile';
import Toast from '../utils/showToast';

export default async (url: string, auth: Auth) => {
  try {
    const uri = await download(url, auth);
    try {
      await Share.share({ url: uri, message: url });
    } catch (error) {
      Toast("Can't share");
    }
  } catch (error) {
    Toast("Can't download");
  }
};
