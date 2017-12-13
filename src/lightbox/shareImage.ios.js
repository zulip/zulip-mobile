/* @flow */
import { Share } from 'react-native';

import type { Auth, TranslateStringType } from '../types';
import downloadFile from '../api/downloadFile';
import { showToast } from '../utils/info';

export default async (url: string, auth: Auth, translateString: TranslateStringType) => {
  try {
    const uri = await downloadFile(url, auth);
    try {
      await Share.share({ url: uri, message: url });
    } catch (error) {
      showToast(translateString('Can not share'));
    }
  } catch (error) {
    showToast(translateString('Can not download'));
  }
};
