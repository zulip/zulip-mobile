/* @flow strict-local */
import { Share } from 'react-native';

import type { GetText } from '../types';
import { BRAND_COLOR } from '../styles';

export default (url: string, _: GetText) => {
  const shareOptions = {
    message: url,
    title: _('Shared using Zulip!'),
  };
  Share.share(shareOptions, { tintColor: BRAND_COLOR }).catch(err => {});
};
