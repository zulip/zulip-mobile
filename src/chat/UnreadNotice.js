import React from 'react';
import { Animated, StyleSheet, Text, Easing } from 'react-native';
import { IconDownArrow } from '../common/Icons';

const styles = StyleSheet.create({
  unreadContainer: {
    padding: 2,
    backgroundColor: '#96A3F9',
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center'
  },
  unreadText: {
    flex: 0.9,
    color: '#FFFFFF',
    fontSize: 14
  },
  icon: {
    flex: 0.05,
    width: 14,
    height: 14,
    margin: 8,
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  }
});

// Duration after which notice should hide
const AUTO_HIDE_DELAY = 1000;

const showAnimationConfig = {
  toValue: 1,
  duration: 400,
  useNativeDriver: true,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

const hideAnimationConfig = {
  toValue: 0,
  duration: 400,
  useNativeDriver: true,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

export default class UnreadNotice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      translateAnimation: new Animated.Value(0),
      visible: false
    };

    this.hideTimeout = null;
  }

  shouldComponentUpdate(nextProps) {
    // Render only when user has scrolled up and unread count updates
    return nextProps.scrollOffset > 0 && this.props.count !== nextProps.count;
  }

  componentWillUpdate(nextProps) {
    const { visible } = this.state;
    const willBecomeVisible = nextProps.count > 0;

    if (!visible && willBecomeVisible) this.show();
  }

  hide = () => {
    this.state.translateAnimation.setValue(1);
    Animated.timing(this.state.translateAnimation, hideAnimationConfig)
      .start(() => {
        this.setState({
          visible: false
        });
      });
  };

  show = () => {
    this.state.translateAnimation.setValue(0);
    Animated.timing(this.state.translateAnimation, showAnimationConfig)
      .start(() => {
        this.setState({
          visible: true
        });
      });

    // Auto-hide notice HIDE_DELAY milliseconds after it's shown
    clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(this.hide, AUTO_HIDE_DELAY);
  };

  dynamicContainerStyles = () => {
    const { shouldOffsetForInput } = this.props;

    // In narrows where ComposeBox is present translate beyond ComposeBox to avoid blocking it
    const translateTo = shouldOffsetForInput ? -40 : 0;
    const translateFrom = shouldOffsetForInput ? 0 : 50;

    return {
      ...StyleSheet.flatten(styles.unreadContainer),
      bottom: 0,
      transform: [
        {
          translateY: this.state.translateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [translateFrom, translateTo]
          })
        }
      ]
    };
  };

  render() {
    const { count } = this.props;

    return (
      <Animated.View style={this.dynamicContainerStyles()}>
        <IconDownArrow style={[styles.icon, styles.downArrowIcon]} />
        <Text style={styles.unreadText}>
          {count === 0 ?
            'No' : count < 100 ?
              count : '99+'} unread {count === 1 ? 'message' : 'messages'}
        </Text>
      </Animated.View>
    );
  }
}
