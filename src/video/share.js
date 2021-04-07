/* @flow strict-local */
import { Share } from 'react-native';

import { BRAND_COLOR } from '../styles';

export default (url: string) => {
  const shareOptions = {
    message: url,
    title: 'Shared using Zulip!',
  };
  Share.share(shareOptions, { tintColor: BRAND_COLOR }).catch(err => {});
};
