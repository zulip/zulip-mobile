/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, RawLabel } from '../common';
import { IconDownArrow } from '../common/Icons';
import { unreadToLimitedCount } from '../utils/unread';
import MarkUnreadButton from './MarkUnreadButton';

const styles = StyleSheet.create({
  unreadContainer: {
    padding: 2,
    backgroundColor: '#96A3F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unreadTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 14,
    color: 'white',
  },
  margin: {
    marginRight: 4,
  },
  icon: {
    margin: 8,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
});

type Props = {
  unreadCount: number,
};

export default class UnreadNotice extends PureComponent {
  props: Props;

  render() {
    const { unreadCount } = this.props;

    // if (unreadCount === 0) return null;

    return (
      <View style={styles.unreadContainer}>
        <View style={styles.unreadTextWrapper}>
          <IconDownArrow style={styles.icon} />
          <RawLabel
            style={[styles.unreadText, styles.margin]}
            text={unreadToLimitedCount(unreadCount)}
          />
          <Label style={styles.unreadText} text="unread messages" />
        </View>
        <MarkUnreadButton />
      </View>
    );
  }
}
