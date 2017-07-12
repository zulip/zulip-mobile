/* @flow */
import React from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Actions, Narrow } from '../../types';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../../utils/narrow';
import TopicMessageHeader from './TopicMessageHeader';
import StreamMessageHeader from './StreamMessageHeader';
import PrivateMessageHeader from './PrivateMessageHeader';
import { NULL_SUBSCRIPTION } from '../../nullObjects';

const styles = StyleSheet.create({
  margin: {
    marginTop: 4,
    marginBottom: 4,
  },
});

export default class MessageHeader extends React.PureComponent {
  props: {
    auth: Auth,
    actions: Actions,
    item: Object,
    narrow: Narrow,
    subscriptions: any[],
    onHeaderLongPress: (item: Object) => void,
  };

  onLongPress = () => {
    const { item, onHeaderLongPress } = this.props;
    onHeaderLongPress(item);
  };

  render() {
    const { actions, item, subscriptions, auth, narrow } = this.props;

    if (isStreamNarrow(narrow)) {
      return (
        <TopicMessageHeader
          key={`section_${item.id}`}
          actions={actions}
          itemId={item.id}
          stream={item.display_recipient}
          topic={item.subject}
          style={styles.margin}
          onLongPress={this.onLongPress}
        />
      );
    }

    if (item.type === 'stream') {
      const stream =
        subscriptions.find(x => x.name === item.display_recipient) || NULL_SUBSCRIPTION;

      return (
        <StreamMessageHeader
          key={`section_${item.id}`}
          actions={actions}
          isPrivate={stream && stream.invite_only}
          isMuted={stream && !stream.in_home_view}
          stream={item.display_recipient}
          topic={item.subject}
          color={stream ? stream.color : '#ccc'}
          itemId={item.id}
          style={styles.margin}
          onLongPress={this.onLongPress}
        />
      );
    }

    if (item.type === 'private' && !isPrivateOrGroupNarrow(narrow) && !isTopicNarrow(narrow)) {
      const recipients =
        item.display_recipient.length > 1
          ? item.display_recipient.filter(r => r.email !== auth.email)
          : item.display_recipient;
      return (
        <PrivateMessageHeader
          key={`section_${item.id}`}
          recipients={recipients}
          itemId={item.id}
          doNarrow={actions.doNarrow}
          style={styles.margin}
          onLongPress={this.onLongPress}
        />
      );
    }

    return null;
  }
}
