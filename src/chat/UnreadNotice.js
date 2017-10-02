/* @flow */
import React, { PureComponent } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { Label, RawLabel, ZulipButton } from '../common';
import { IconDownArrow } from '../common/Icons';
import { unreadToLimitedCount } from '../utils/unread';

const styles = StyleSheet.create({
  unreadContainer: {
    padding: 2,
    backgroundColor: '#96A3F9',
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
  button: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    margin: 5,
  },
});

type Props = {
  unreadCount: number,
};

export default class UnreadNotice extends PureComponent {
  props: Props;

  render() {
    const { unreadCount } = this.props;

    if (unreadCount === 0) return null;

    return (
      <Animated.View style={styles.unreadContainer}>
        <IconDownArrow style={styles.icon} />
        <RawLabel
          style={[styles.unreadText, styles.margin]}
          text={unreadToLimitedCount(unreadCount)}
        />
        <Label style={styles.unreadText} text="unread messages" />
        <ZulipButton style={styles.button} text="Mark all read" />
      </Animated.View>
    );
  }
}
