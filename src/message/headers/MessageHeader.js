/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Actions, Narrow, MuteState } from '../../types';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../../utils/narrow';
import TopicMessageHeader from './TopicMessageHeader';
import StreamMessageHeader from './StreamMessageHeader';
import PrivateMessageHeader from './PrivateMessageHeader';
import { nullFunction, NULL_SUBSCRIPTION } from '../../nullObjects';
import { executeActionSheetAction, constructHeaderActionButtons } from '../messageActionSheet';
import type { ShowActionSheetTypes } from '../messageActionSheet';

const styles = StyleSheet.create({
  margin: {
    marginTop: 4,
    marginBottom: 4,
  },
});

class MessageHeader extends PureComponent {
  props: {
    auth: Auth,
    actions: Actions,
    message: Object,
    narrow: Narrow,
    subscriptions: any[],
    showActionSheetWithOptions: (Object, (number) => void) => void,
    mute: MuteState,
  };

  showActionSheet = ({ options, cancelButtonIndex, callback }: ShowActionSheetTypes) => {
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      callback,
    );
  };

  handleLongPress = () => {
    const { actions, subscriptions, mute, auth, message } = this.props;
    const options = constructHeaderActionButtons({ message, subscriptions, mute });
    const callback = buttonIndex => {
      executeActionSheetAction({
        actions,
        title: options[buttonIndex],
        message,
        header: true,
        auth,
        subscriptions,
      });
    };
    this.showActionSheet({ options, cancelButtonIndex: options.length - 1, callback });
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
          onLongPress={this.handleLongPress}
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
          onLongPress={this.handleLongPress}
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

export default MessageHeader;
