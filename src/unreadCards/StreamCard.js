/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';

import StreamCardHeader from './StreamCardHeader';
import TopicList from './TopicList';
import DummyMessage from './DummyMessage';
import { IconCross, IconCheck } from '../common/Icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Amount the card must be dragged to perform complete swipe
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const styles = StyleSheet.create({
  card: {
    borderRadius: 2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 4,
    shadowOpacity: 0.08,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    borderRadius: 2,
    width: SCREEN_WIDTH * 0.95,
    justifyContent: 'center',
    backgroundColor: '#5B82FF',
    alignSelf: 'center',
  },
  readIndicatorText: {
    color: '#FFFFFF',
  },
});

export default class StreamCard extends PureComponent {
  state = {
    cardHeight: 100,
  };

  props: {
    stream?: string,
    color?: string,
    topics?: any,
    unreadCount: number,
    isPrivate: boolean,
    sender?: string,
    onSwipe: () => void,
  };

  animated_position = new Animated.ValueXY();
  animated_height = new Animated.Value(1);

  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      let xOffset = gesture.dx;
      if (
        xOffset > 0 // Allow only right swipes
      )
        this.animated_position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (event, gesture) => {
      this.handleTouchEnd(gesture.dx);
    },
    onPanResponderReject: (e, gesture) => {
      this.handleTouchEnd(gesture.dx);
    },
    onPanResponderTerminate: (e, gesture) => {
      this.handleTouchEnd(gesture.dx);
    },
    onPanResponderEnd: (e, gesture) => {
      this.handleTouchEnd(gesture.dx);
    },
  });

  handleTouchEnd = xOffset => {
    if (xOffset > SWIPE_THRESHOLD) {
      this.forceSwipe();
    } else {
      this.resetPosition();
    }
  };

  onSwipeComplete = () => {
    const { onSwipe } = this.props;

    Animated.timing(this.animated_height, {
      toValue: 0,
      duration: SWIPE_OUT_DURATION,
    }).start(onSwipe);
  };

  // If touch ends beyond SWIPE_THRESHOLD swipe the card out forcefully
  forceSwipe = () => {
    Animated.timing(this.animated_position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION,
    }).start(() => this.onSwipeComplete());
  };

  resetPosition = () => {
    Animated.spring(this.animated_position, {
      toValue: { x: 0, y: 0 },
    }).start();
  };

  dynamicContainerStyles = () => [
    styles.container,
    {
      height: this.animated_height.interpolate({
        inputRange: [0, 1],
        outputRange: [0, this.state.cardHeight],
      }),
    },
  ];

  dynamicReadIndicatorStyles = () => ({
    position: 'absolute',
    left: 10,
    flexDirection: 'column',
    opacity: this.animated_position.x.interpolate({
      inputRange: [SWIPE_THRESHOLD, SCREEN_WIDTH * 0.9],
      outputRange: [1, 0],
    }),
    transform: [
      {
        translateX: this.animated_position.x.interpolate({
          inputRange: [0, SWIPE_THRESHOLD],
          outputRange: [0, 20],
        }),
      },
    ],
  });

  measureView = event => {
    this.setState({
      cardHeight: event.nativeEvent.layout.height,
    });
  };

  render() {
    const { stream, color, topics, unreadCount, isPrivate, sender } = this.props;
    return (
      <Animated.View style={this.dynamicContainerStyles()}>
        <Animated.View style={this.dynamicReadIndicatorStyles()}>
          <IconCheck size={48} color="#FFFFFF" />
          <Text style={styles.readIndicatorText}>Read</Text>
        </Animated.View>
        <Animated.View
          onLayout={event => this.measureView(event)}
          {...this.panResponder.panHandlers}
          style={[styles.card, { left: this.animated_position.x }]}>
          <StreamCardHeader
            isPrivate={isPrivate}
            sender={sender}
            unreadCount={unreadCount}
            streamName={stream}
            color={color}
          />
          {isPrivate ? <DummyMessage /> : <TopicList topics={topics} />}
        </Animated.View>
      </Animated.View>
    );
  }
}
