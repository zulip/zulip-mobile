/* @flow */
import React from 'react';
import type { Children } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import ReactionList from '../reactions/ReactionList';
import MessageTags from './MessageTags';

const styles = StyleSheet.create({
  message: {
    paddingTop: 0,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 48,
    overflow: 'hidden',
    flex: 1,
  },
  messageContentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  childrenWrapper: {
    flex: 1,
  },
});

export default class MessageBrief extends React.PureComponent {
  props: {
    message: Object,
    ownEmail: string,
    starred: boolean,
    children?: Children,
    onLongPress: () => void,
  };

  defaultProps: {
    children: [],
    twentyFourHourTime: false,
  };

  render() {
    const { message, children, ownEmail, onLongPress, starred } = this.props;

    return (
      <View style={styles.message}>
        <View style={styles.messageContentWrapper}>
          <TouchableWithoutFeedback onLongPress={onLongPress}>
            <View style={styles.childrenWrapper}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
        <MessageTags timestamp={message.last_edit_timestamp} starred={starred} />
        <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
      </View>
    );
  }
}
