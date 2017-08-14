/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, ScrollView } from 'react-native';

import ReactionList from '../reactions/ReactionList';
import MessageTags from './MessageTags';
import HtmlChildrenContainer from './HtmlChildrenContainer';

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
});

export default class MessageBrief extends PureComponent {
  props: {
    message: Object,
    ownEmail: string,
    starred: boolean,
    auth: Auth,
    actions: Actions,
    onLongPress: () => void,
    isNotYetSent?: boolean,
  };

  render() {
    const { message, auth, actions, ownEmail, onLongPress, starred, isNotYetSent } = this.props;

    return (
      <View style={styles.message}>
        <View style={styles.messageContentWrapper}>
          <ScrollView style={styles.childrenWrapper}>
            <TouchableWithoutFeedback onLongPress={onLongPress}>
              <HtmlChildrenContainer
                message={message}
                auth={auth}
                actions={actions}
                handleLinkPress={this.handleLinkPress}
              />
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
        <MessageTags
          timestamp={message.last_edit_timestamp}
          starred={starred}
          isNotYetSent={isNotYetSent}
        />
        <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
      </View>
    );
  }
}
