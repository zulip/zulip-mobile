/* @flow */
import React, { PureComponent } from 'react';
import type { Children } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, ScrollView } from 'react-native';

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

export default class MessageBrief extends PureComponent {
  props: {
    message: Object,
    ownEmail: string,
    starred: boolean,
    children?: Children,
    onLongPress: () => void,
  };

  static defaultProps = {
    twentyFourHourTime: false,
  };

  render() {
    const { message, children, ownEmail, onLongPress, starred, outbox } = this.props;

    return (
      <View style={styles.message}>
        <View style={styles.messageContentWrapper}>
          <ScrollView style={styles.childrenWrapper}>
            <TouchableWithoutFeedback onLongPress={onLongPress}>
              <View>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
        <MessageTags timestamp={message.last_edit_timestamp} starred={starred} outbox={outbox} />
        <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
      </View>
    );
  }
}
