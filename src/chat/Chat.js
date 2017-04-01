import React from 'react';
import { KeyboardAvoidingView } from 'react-native';

import { styles, OfflineNotice } from '../common';
import { canSendToNarrow } from '../utils/narrow';
import MessageList from '../message/MessageList';
import MessageListLoading from '../message/MessageListLoading';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';

export default class Chat extends React.Component {
  render() {
    const { messages, narrow, caughtUp, fetching, isOnline } = this.props;
    const noMessages = messages.length === 0 && caughtUp.older && caughtUp.newer;
    const noMessagesButLoading = messages.length === 0 && (fetching.older || fetching.newer);

    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        {!isOnline && <OfflineNotice />}
        {noMessages && <NoMessages narrow={narrow} />}
        {noMessagesButLoading && <MessageListLoading />}
        {!noMessages && !noMessagesButLoading && <MessageList {...this.props} />}
        {canSendToNarrow(narrow) && <ComposeBox onSend={this.sendMessage} />}
      </KeyboardAvoidingView>
    );
  }
}
