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

const POSITIONS = {
  top: 'top',
  bottom: 'bottom'
};

const showAnimationConfig = {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

const hideAnimationConfig = {
  toValue: 0,
  duration: 400,
  easing: Easing.bezier(0.17, 0.67, 0.11, 0.99)
};

export default class UnreadNotice extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      translateAnimation: new Animated.Value(0)
    };
  }

  componentDidMount() {
    this.show();
  }

  hide = () => {
    this.state.translateAnimation.setValue(1);
    Animated.timing(this.state.translateAnimation, hideAnimationConfig).start();
  };

  show = () => {
    this.state.translateAnimation.setValue(0);
    Animated.timing(this.state.translateAnimation, showAnimationConfig).start();
  };

  dynamicContainerStyles = () => {
    const { position } = this.props;
    const translationMultiplier = position === POSITIONS.top ? -1 : 1;

    return {
      ...StyleSheet.flatten(styles.unreadContainer),
      bottom: position === POSITIONS.bottom ? 0 : null,
      top: position === POSITIONS.top ? 0 : null,
      transform: [
        {
          translateY: this.state.translateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [translationMultiplier * 50, 0]
          })
        }
      ]
    };
  };

  render() {
    return (
      <Animated.View style={this.dynamicContainerStyles()}>
        <IconDownArrow style={[styles.icon, styles.downArrowIcon]} />
        <Text style={styles.unreadText}>
          New unread messages
        </Text>
      </Animated.View>
    );
  }
}
