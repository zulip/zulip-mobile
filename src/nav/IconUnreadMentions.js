/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getUnreadMentionsTotal } from '../selectors';
import { IconMention } from '../common/Icons';
import { CountOverlay } from '../common';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  unreadMentionsTotal: number,
  color: string,
|}>;

function IconUnreadMentions(props: Props) {
  const { unreadMentionsTotal, color } = props;

  return (
    <View>
      <CountOverlay unreadCount={unreadMentionsTotal}>
        <IconMention size={24} color={color} />
      </CountOverlay>
    </View>
  );
}

export default connect(state => ({
  unreadMentionsTotal: getUnreadMentionsTotal(state),
}))(IconUnreadMentions);
