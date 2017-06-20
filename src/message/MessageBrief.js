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
    justifyContent: 'space-between'
  },
});

export default class MessageBrief extends React.PureComponent {

  props: {
    message: Object,
    selfEmail: string,
    starred: boolean,
    onLongPress: () => void,
    children?: Children,
    twentyFourHourTime?: boolean,
  };

  defaultProps: {
    children: [],
    twentyFourHourTime: false,
  };

  render() {
    const { message, children, selfEmail, onLongPress, starred } = this.props;

    return (
      <View style={styles.message}>
        <View style={styles.messageContentWrapper}>
          <TouchableWithoutFeedback onLongPress={onLongPress}>
            <View>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
        <ReactionList
          messageId={message.id}
          reactions={message.reactions}
          selfEmail={selfEmail}
        />
        <MessageTags
          timestamp={message.edit_timestamp}
          starred={starred}
        />
      </View>
    );
  }
}
