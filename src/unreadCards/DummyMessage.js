/* @flow */
// Renders dummy message.

import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import renderHtmlChildren from '../html/renderHtmlChildren';
import htmlToDomTree from '../html/htmlToDomTree';
import MessageFull from '../message/MessageFull';

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

export default class DummyMessage extends PureComponent {
  render() {
    const childrenNodes = htmlToDomTree(message.match_content || message.content);

    return (
      <MessageFull
        message={message}
        twentyFourHourTime={false}
        ownEmail={auth.email}
        doNarrow={() => {}}
        onLongPress={() => {}}
        starred={false}
        realm={auth.realm}>
        {renderHtmlChildren({
          childrenNodes,
          auth,
          actions,
          message,
          onPress: () => {},
        })}
      </MessageFull>
    );
  }
}
