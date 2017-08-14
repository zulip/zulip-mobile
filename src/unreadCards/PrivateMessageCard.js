/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';

import renderHtmlChildren from '../html/renderHtmlChildren';
import htmlToDomTree from '../html/htmlToDomTree';
import MessageFull from '../message/MessageFull';
import PrivateMessageCardHeader from './PrivateMessageCardHeader';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Dummy data
const message = {
  avatar_url:
  'https://secure.gravatar.com/avatar/37641655de3d5700215259f7bbefe3cd?d=identicon&version=1',
  client: 'website',
  content: '<p>Great talk to you then</p>',
  content_type: 'text/html',
  display_recipient: [],
  flags: ['read'],
  id: 264613,
  reactions: [],
  recipient_id: 1959,
  sender_email: 'neeraj.wahi@gmail.com',
  sender_full_name: 'Neeraj Wahi',
  sender_id: 17,
  sender_realm_str: 'tabbot',
  sender_short_name: 'neeraj.wahi',
  subject: '',
  subject_links: [],
  timestamp: 1502300755,
};

const auth = {
  apiKey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  email: 'nishantve1@gmail.com',
  realm: 'https://chat.zulip.org',
};

const actions = {
  dummyAction: 'my actions',
};


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

export default class PrivateMessageCard extends PureComponent {
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
    const { sender, unreadCount } = this.props;
    const childrenNodes = htmlToDomTree(message.match_content || message.content);

    return (
      <Animated.View
        {...this.state.panResponder.panHandlers}
        style={[styles.container, { left: this.state.position.x }]}>
        <PrivateMessageCardHeader
          unreadCount={unreadCount}
          sender={sender}
        />
        <MessageFull
          message={message}
          twentyFourHourTime={false}
          ownEmail={auth.email}
          doNarrow={() => { }}
          onLongPress={() => { }}
          starred={false}
          realm={auth.realm}>
          {renderHtmlChildren({
            childrenNodes,
            auth,
            actions,
            message,
            onPress: () => { },
          })}
        </MessageFull>
      </Animated.View>
    );
  }
}
