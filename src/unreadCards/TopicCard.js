/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import renderHtmlChildren from '../html/renderHtmlChildren';
import htmlToDomTree from '../html/htmlToDomTree';
import MessageFull from '../message/MessageFull';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    padding: 6,
    paddingLeft: 8,
    backgroundColor: '#EDE4E4',
    alignItems: 'center'
  }
});

// Dummy data
const message = {
  avatar_url: 'https://secure.gravatar.com/avatar/37641655de3d5700215259f7bbefe3cd?d=identicon&version=1',
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
  timestamp: 1502300755
};

const auth = {
  apiKey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  email: 'nishantve1@gmail.com',
  realm: 'https://chat.zulip.org'
};

const actions = {
  dummyAction: 'my actions'
};

const UnreadCount = ({ count }) => (
  <View style={{
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    padding: 3,
    backgroundColor: '#979797',
    marginLeft: 8
  }}>
   <Text style={{
      color: '#FFFFFF',
      fontSize: 10,
      borderRadius: 100
    }}> {count} </Text>
  </View>

);

const Header = ({ heading, unreadCount }) => (
  <View style={styles.header}>
    <Text>{heading}</Text>
    <UnreadCount count={unreadCount} />
  </View>
);

export default class TopicCard extends PureComponent {
  render() {
    const { topicName } = this.props;
    const childrenNodes = htmlToDomTree(message.match_content || message.content);

    return (
      <View style={styles.container}>
        <Header
          heading={topicName}
          unreadCount={2}
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
      </View>
    );
  }
};
