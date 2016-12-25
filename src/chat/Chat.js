import React from 'react';
import {
  KeyboardAvoidingView,
} from 'react-native';

import { styles, OfflineNotice } from '../common';
import MessageList from '../message-list/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';

export default class MainScreen extends React.Component {

  render() {
    const { auth, messages, narrow, fetching, subscriptions,
      caughtUp, isOnline, twentyFourHourTime, doNarrow, fetchOlder, fetchNewer } = this.props;

    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        {!isOnline && <OfflineNotice />}
        {messages.length === 0 && !fetching && <NoMessages narrow={narrow} />}
        <MessageList
          messages={messages}
          narrow={narrow}
          fetching={fetching}
          twentyFourHourTime={twentyFourHourTime}
          subscriptions={subscriptions}
          auth={auth}
          caughtUp={caughtUp}
          fetchOlder={fetchOlder}
          fetchNewer={fetchNewer}
          doNarrow={doNarrow}
        />
        <ComposeBox onSend={this.sendMessage} />
      </KeyboardAvoidingView>
    );
  }
}
