import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import ReactionList from '../reactions/ReactionList';
import IconStarMessage from './IconStarMessage';
import EditedTag from './EditedTag';

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
  messageTextBodyWrapper: {
    flex: 0.9
  }
});

export default class MessageBrief extends React.PureComponent {

  props: {
    message: {},
    selfEmail: string,
    reactions: [],
  };

  render() {
    const { message, children, selfEmail, onLongPress, starred } = this.props;

    return (
      <View style={styles.message}>
        <View style={styles.messageContentWrapper}>
          <View style={styles.messageTextBodyWrapper}>
            <TouchableWithoutFeedback onLongPress={onLongPress}>
              <View>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
          {starred && <IconStarMessage />}
        </View>
        <ReactionList
          messageId={message.id}
          reactions={message.reactions}
          selfEmail={selfEmail}
        />
        <EditedTag
          timestamp={message.edit_timestamp}
        />
      </View>
    );
  }
}
