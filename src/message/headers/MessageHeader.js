/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Actions, Narrow } from '../../types';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../../utils/narrow';
import TopicMessageHeader from './TopicMessageHeader';
import StreamMessageHeader from './StreamMessageHeader';
import PrivateMessageHeader from './PrivateMessageHeader';
import { nullFunction, NULL_SUBSCRIPTION } from '../../nullObjects';

const styles = StyleSheet.create({
  margin: {
    marginTop: 4,
    marginBottom: 4,
  },
});

export default class MessageHeader extends PureComponent {
  props: {
    auth: Auth,
    actions: Actions,
    message: Object,
    narrow: Narrow,
    subscriptions: any[],
    onHeaderLongPress: (message: Object) => void,
  };

  onLongPress = () => {
    const { message, onHeaderLongPress } = this.props;
    onHeaderLongPress(message);
  };

  render() {
    const { actions, message, subscriptions, auth, narrow } = this.props;

    if (isStreamNarrow(narrow)) {
      return (
        <TopicMessageHeader
          key={`section_${message.id}`}
          actions={actions}
          messageId={message.id}
          stream={message.display_recipient}
          topic={message.subject}
          style={styles.margin}
          onLongPress={this.onLongPress}
        />
      );
    }

    if (message.type === 'stream') {
      const stream =
        subscriptions.find(x => x.name === message.display_recipient) || NULL_SUBSCRIPTION;

      return (
        <StreamMessageHeader
          key={`section_${message.id}`}
          actions={actions}
          isPrivate={stream && stream.invite_only}
          isMuted={stream && !stream.in_home_view}
          stream={message.display_recipient}
          topic={message.subject}
          color={stream ? stream.color : '#ccc'}
          messageId={message.id}
          style={styles.margin}
          onLongPress={this.onLongPress}
        />
      );
    }

    if (message.type === 'private' && !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow)) {
      const recipients =
        message.display_recipient.length > 1
          ? message.display_recipient.filter(r => r.email !== auth.email)
          : message.display_recipient;
      return (
        <PrivateMessageHeader
          key={`section_${message.id}`}
          recipients={recipients}
          messageId={message.id}
          doNarrow={actions.doNarrow}
          style={styles.margin}
          onLongPress={nullFunction}
        />
      );
    }

    return null;
  }
}
