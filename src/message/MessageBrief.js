/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import ReactionList from '../reactions/ReactionList';
import MessageTags from './MessageTags';
import HtmlChildrenContainer from './HtmlChildrenContainer';
import type { Auth, Actions } from '../types';

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

type Props = {
  message: Object,
  ownEmail: string,
  starred: boolean,
  auth?: Auth,
  actions: Actions,
  onLinkPress: string => void,
  onLongPress: () => void,
};

export default class MessageBrief extends PureComponent<Props> {
  props: Props;

  render() {
    const { message, auth, actions, onLinkPress, ownEmail, onLongPress, starred } = this.props;

    return (
      <View style={styles.message}>
        <View style={styles.messageContentWrapper}>
          <ScrollView style={styles.childrenWrapper}>
            <HtmlChildrenContainer
              message={message}
              auth={auth}
              actions={actions}
              onLinkPress={onLinkPress}
              onLongPress={onLongPress}
            />
          </ScrollView>
        </View>
        <MessageTags
          timestamp={message.last_edit_timestamp}
          starred={starred}
          isOutbox={message.isOutbox}
        />
        <ReactionList messageId={message.id} reactions={message.reactions} ownEmail={ownEmail} />
      </View>
    );
  }
}
