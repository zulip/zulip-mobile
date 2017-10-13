/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, RawLabel } from '../common';
import { unreadToLimitedCount } from '../utils/unread';
import MarkUnreadButton from './MarkUnreadButton';

const styles = StyleSheet.create({
  unreadContainer: {
    padding: 4,
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
    padding: 2,
  },
});

type Props = {
  unreadCount: number,
};

export default class UnreadNotice extends PureComponent<Props> {
  props: Props;

  render() {
    const { unreadCount } = this.props;

    if (unreadCount === 0) return null;

    return (
      <View style={styles.unreadContainer}>
        <View style={styles.unreadTextWrapper}>
          <RawLabel style={[styles.unreadText]} text={unreadToLimitedCount(unreadCount)} />
          <Label
            style={styles.unreadText}
            text={unreadCount === 1 ? 'unread message' : 'unread messages'}
          />
        </View>
        <MarkUnreadButton />
      </View>
    );
  }
}
