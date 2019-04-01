/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import { getUnreadCountForNarrow } from '../selectors';
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

type OwnProps = {|
  limited: boolean,
  narrow: Narrow,
|};

type StateProps = {|
  unreadCount: number,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

class UnreadNotice extends PureComponent<Props> {
  static defaultProps = {
    limited: false,
  };

  render() {
    const { limited, narrow, unreadCount } = this.props;

    return (
      <AnimatedScaleComponent visible={unreadCount > 0}>
        <View style={styles.unreadContainer}>
          <View style={styles.unreadTextWrapper}>
            <RawLabel
              style={styles.unreadText}
              text={limited ? unreadToLimitedCount(unreadCount) : unreadCount.toString()}
            />
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

export default connect((state, props) => ({
  unreadCount: getUnreadCountForNarrow(state, props.narrow),
}))(UnreadNotice);
