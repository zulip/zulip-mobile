import React from 'react';
import {
  KeyboardAvoidingView,
} from 'react-native';

import { styles, OfflineNotice } from '../common';
import { canSendToNarrow } from '../utils/narrow';
import MessageList from '../message-list/MessageListWeb';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';

export default class MainScreen extends React.Component {

  render() {
    const { auth, messages, narrow, isFetching, subscriptions,
      isOnline, twentyFourHourTime, pushRoute, doNarrow, fetchOlder } = this.props;

    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        {!isOnline && <OfflineNotice />}
        {messages.length === 0 && !isFetching && <NoMessages narrow={narrow} />}
        <MessageList
          messages={messages}
          narrow={narrow}
          isFetching={isFetching}
          twentyFourHourTime={twentyFourHourTime}
          subscriptions={subscriptions}
          auth={auth}
          fetchOlder={fetchOlder}
          pushRoute={pushRoute}
          doNarrow={doNarrow}
        />
        {canSendToNarrow(narrow) && <ComposeBox onSend={this.sendMessage} />}
      </KeyboardAvoidingView>
    );
  }
}
