/* @flow */
import { Share } from 'react-native';

import type { Account } from '../types';
import downloadImage from './downloadImage';
import { showToast } from '../utils/info';

export default async (url: string, auth: Account) => {
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
};
