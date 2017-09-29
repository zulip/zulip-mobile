/* @flow */
import React, { PureComponent } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

import { Label, RawLabel } from '../common';
import { IconDownArrow } from '../common/Icons';
import { unreadToLimitedCount } from '../utils/unread';

const styles = StyleSheet.create({
  unreadContainer: {
    padding: 2,
    backgroundColor: '#96A3F9',
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
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

const showAnimationConfig = {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99),
  useNativeDriver: true,
};

const hideAnimationConfig = {
  toValue: 0,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99),
  useNativeDriver: true,
};

// Duration after which notice should hide
const HIDE_DELAY = 1500;
// The translation of notice interpolates this.translateAnimation from 0 to 1
// Fraction of interpolation at which notice goes into peeking state
const PEEKING_FRACTION = 0.3;
// Amount notice should translate to get itself into the screen
const MAX_TRANSLATION = 40;

// Notice States
const STATE_HIDDEN = 'hidden';
const STATE_VISIBLE = 'visible';
const STATE_PEEKING = 'peeking';

type Props = {
  unreadCount: number,
  scrollOffset: number,
  shouldOffsetForInput: boolean,
};

export default class UnreadNotice extends PureComponent {
  props: Props;

  hideTimeout = null;

  state = {
    translateAnimation: new Animated.Value(0),
    noticeState: STATE_HIDDEN,
  };

  componentWillReceiveProps(nextProps: Props) {
    const { unreadCount, scrollOffset } = nextProps;
    const { noticeState } = this.state;

    const shouldBecomeVisible =
      nextProps.unreadCount > unreadCount && unreadCount > 0 && scrollOffset > 0;

    if (noticeState === STATE_PEEKING && unreadCount === 0) {
      this.hidePeekingNotice();
    }

    if (noticeState === STATE_HIDDEN && shouldBecomeVisible) {
      this.show();
    } else if (noticeState === STATE_PEEKING && shouldBecomeVisible) {
      this.show();
    } else if (noticeState === STATE_VISIBLE && !shouldBecomeVisible) {
      this.hide();
    }
  }

  show = () => {
    this.state.translateAnimation.setValue(0);
    Animated.timing(this.state.translateAnimation, showAnimationConfig).start(() => {
      this.setState({
        noticeState: STATE_VISIBLE,
      });

      // Notice should go into peeking state
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(this.hide, HIDE_DELAY);
    });
  };

  hide = () => {
    const { unreadCount } = this.props;
    this.state.translateAnimation.setValue(1);
    Animated.timing(
      this.state.translateAnimation,
      Object.assign({}, hideAnimationConfig, { toValue: unreadCount === 0 ? 0 : PEEKING_FRACTION }),
    ).start(() => {
      this.setState({
        noticeState:
          this.state.translateAnimation._value === 0 // eslint-disable-line
            ? STATE_HIDDEN
            : STATE_PEEKING,
      });
    });
  };

  hidePeekingNotice = () => {
    this.state.translateAnimation.setValue(PEEKING_FRACTION);
    Animated.timing(this.state.translateAnimation, hideAnimationConfig).start(() => {
      this.setState({
        noticeState: STATE_HIDDEN,
      });
    });
  };

  dynamicContainerStyles = () => {
    const { shouldOffsetForInput } = this.props;

    // In narrows where ComposeBox is present translate beyond ComposeBox to avoid blocking it
    const translateFrom = shouldOffsetForInput ? 0 : MAX_TRANSLATION;
    const translateTo = shouldOffsetForInput ? -MAX_TRANSLATION : 0;

    return {
      bottom: 0,
      opacity: this.state.translateAnimation.interpolate({
        inputRange: [0, PEEKING_FRACTION, 1],
        outputRange: [0, 1, 1],
      }),
      transform: [
        {
          translateY: this.state.translateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [translateFrom, translateTo],
          }),
        },
      ],
    };
  };

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
      </Animated.View>
    );
  }
}
