/* @flow */
import { Share } from 'react-native';

import type { Account } from '../types';
import downloadImage from './downloadImage';
import { showToast } from '../utils/info';

export default async (url: string, account: Account) => {
  try {
    const uri = await downloadImage(url, account);
    try {
      await Share.share({ url: uri, message: url });
    } catch (error) {
      showToast('Can not share');
    }
  } catch (error) {
    showToast('Can not download');
  }
};
