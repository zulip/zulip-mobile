/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import connectWithActions from '../connectWithActions';
import { getUnreadCountInActiveNarrow } from '../selectors';
import { Label, RawLabel } from '../common';
import { unreadToLimitedCount } from '../utils/unread';
import MarkUnreadButton from './MarkUnreadButton';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

const styles = StyleSheet.create({
  unreadContainer: {
    padding: 4,
    backgroundColor: '#96A3F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
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

class UnreadNotice extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { unreadCount } = this.props;

    return (
      <AnimatedScaleComponent visible={unreadCount > 0}>
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
      </AnimatedScaleComponent>
    );
  }
}

export default connectWithActions(state => ({
  unreadCount: getUnreadCountInActiveNarrow(state),
}))(UnreadNotice);
