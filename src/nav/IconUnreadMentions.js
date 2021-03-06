/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';

import { useSelector } from '../react-redux';
import { getUnreadMentionsTotal } from '../selectors';
import { IconMention } from '../common/Icons';
import { CountOverlay } from '../common';

type Props = $ReadOnly<{|
  color: string,
|}>;

export default function IconUnreadMentions(props: Props) {
  const { color } = props;
  const unreadMentionsTotal = useSelector(getUnreadMentionsTotal);

  return (
    <View>
      <CountOverlay unreadCount={unreadMentionsTotal}>
        <IconMention size={24} color={color} />
      </CountOverlay>
    </View>
  );
}
