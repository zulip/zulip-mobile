/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getUnreadPmsTotal, getUnreadHuddlesTotal } from '../selectors';
import { IconPeople } from '../common/Icons';
import { ComponentWithOverlay, UnreadCount } from '../common';

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
});

type Props = {|
  dispatch: Dispatch,
  unreadHuddlesTotal: number,
  unreadPmsTotal: number,
  color: string,
|};

class IconUnreadConversations extends PureComponent<Props> {
  render() {
    const { unreadHuddlesTotal, unreadPmsTotal, color } = this.props;
    const unreadCount = unreadHuddlesTotal + unreadPmsTotal;

    return (
      <ComponentWithOverlay
        style={styles.button}
        overlaySize={15}
        showOverlay={unreadCount > 0}
        overlay={<UnreadCount count={unreadCount} />}
      >
        <IconPeople size={24} color={color} />
      </ComponentWithOverlay>
    );
  }
}

export default connect(state => ({
  unreadHuddlesTotal: getUnreadHuddlesTotal(state),
  unreadPmsTotal: getUnreadPmsTotal(state),
}))(IconUnreadConversations);
