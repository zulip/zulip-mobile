/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';

import { IconStream } from '../common/Icons';
import StreamCardHeader from './StreamCardHeader';
import StreamUnreadCount from './StreamUnreadCount';
import TopicList from './TopicList';

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.95,
    borderRadius: 2,
    alignSelf: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 4,
    shadowOpacity: 0.08,
    margin: 5,
    marginTop: 10,
    backgroundColor: '#fff',
  },
});

export default class StreamCard extends PureComponent {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        console.log('RELEASED');
        this.resetPosition();
      },
      onPanResponderReject: () => {
        console.log('REJECTED');
        this.resetPosition();
      },
      onPanResponderTerminate: () => {
        console.log('TERMINATED');
        this.resetPosition();
      },
      onPanResponderEnd: () => {
        console.log('ENDED');
        this.resetPosition();
      },
    });

    this.state = { panResponder, position };
  }

  resetPosition = () => {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 },
    }).start();
  };

  render() {
    const { stream, color, topics, unreadCount } = this.props;

    console.log('topics: ', topics);

    return (
      <Animated.View
        {...this.state.panResponder.panHandlers}
        style={[styles.container, { left: this.state.position.x }]}>
        <StreamCardHeader streamName={stream} color={color} />
        <TopicList topics={topics} />
        <StreamUnreadCount count={unreadCount} />
      </Animated.View>
    );
  }
}
