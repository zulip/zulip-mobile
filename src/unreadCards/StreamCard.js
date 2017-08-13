/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';

import { IconStream } from '../common/Icons';
import TopicCard from './TopicCard';

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
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#8999FF',
    padding: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4
  }
});

const Header = () => (
    <View style={styles.header}>
      <IconStream size={16} color="#fff" />
      <Text style={styles.headerText}>mobile</Text>
    </View>
  );

const UnreadCount = ({ count }) => (
  <View style={{
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 100,
    padding: 6,
    backgroundColor: '#E34730',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  }}>
    <Text style={{
      color: '#FFFFFF'
    }}> {count} </Text>
  </View>
);

export default class StreamCard extends PureComponent {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({x: gesture.dx, y: gesture.dy});
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
      }
    });

    this.state = { panResponder, position };
  }

  resetPosition = () => {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0}
    }).start();
  };

  render() {
    return (
      <Animated.View 
        {...this.state.panResponder.panHandlers}
        style={[styles.container, { left: this.state.position.x }]}>
        <Header />
        <TopicCard 
          topicName="Design"
        />
        <UnreadCount count={2} />
      </Animated.View>
    );
  }
};