/* @flow strict-local */
import { Share } from 'react-native';

import type { Auth, GetText } from '../types';
import downloadImage from './downloadImage';
import { showToast } from '../utils/info';

export default async (url: string, auth: Auth, _: GetText) => {
  try {
    const uri = await downloadImage(url, auth);
    try {
      await Share.share({ url: uri, message: url });
    } catch (error) {
      showToast(_('Can not share'));
    }
  } catch (error) {
    showToast(_('Can not download'));
  }
};
