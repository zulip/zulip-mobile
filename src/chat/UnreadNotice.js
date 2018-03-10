/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import { getUnreadCountforNarrow } from '../selectors';
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
  narrow: Narrow,
  unreadCount: number,
};

class UnreadNotice extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { unreadCount } = this.props;
    const { narrow } = this.props;

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
          <MarkUnreadButton narrow={narrow} />
        </View>
      </AnimatedScaleComponent>
    );
  }
}

export default connectWithActions((state, props) => ({
  unreadCount: getUnreadCountforNarrow(props.narrow)(state),
}))(UnreadNotice);
