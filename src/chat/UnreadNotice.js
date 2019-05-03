/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getUnreadCountForNarrow } from '../selectors';
import { Label, RawLabel } from '../common';
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

type SelectorProps = {|
  unreadCount: number,
|};

type Props = {|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|};

class UnreadNotice extends PureComponent<Props> {
  render() {
    const { narrow, unreadCount } = this.props;

    return (
      <AnimatedScaleComponent visible={unreadCount > 0}>
        <View style={styles.unreadContainer}>
          <View style={styles.unreadTextWrapper}>
            <RawLabel style={styles.unreadText} text={unreadCount.toString()} />
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

export default connect((state, props): SelectorProps => ({
  unreadCount: getUnreadCountForNarrow(state, props.narrow),
}))(UnreadNotice);
