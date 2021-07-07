/* @flow strict-local */

import React from 'react';
import { View } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getUnreadPmsTotal, getUnreadHuddlesTotal } from '../selectors';
import { IconPeople } from '../common/Icons';
import { CountOverlay } from '../common';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  unreadHuddlesTotal: number,
  unreadPmsTotal: number,
  color: string,
|}>;

function IconUnreadConversations(props: Props) {
  const { unreadHuddlesTotal, unreadPmsTotal, color } = props;
  const unreadCount = unreadHuddlesTotal + unreadPmsTotal;

  return (
    <View>
      <CountOverlay unreadCount={unreadCount}>
        <IconPeople size={24} color={color} />
      </CountOverlay>
    </View>
  );
}

export default connect(state => ({
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
}))(IconUnreadConversations);
