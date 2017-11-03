/* @flow */
import { Share } from 'react-native';

import type { Auth } from '../types';
import download from '../api/downloadFile';
import Toast from '../utils/showToast';

export default async (url: string, auth: Auth) => {
  try {
    await download(url, auth, res =>
      Share.share({ url: res }).catch(err => {
        Toast("Can't share");
      }),
    );
  } catch (error) {
    Toast('Can\'t download');
  }
};
