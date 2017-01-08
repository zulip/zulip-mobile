import React from 'react';
import {
  KeyboardAvoidingView,
} from 'react-native';

import { styles, OfflineNotice } from '../common';
import { canSendToNarrow } from '../utils/narrow';
import MessageList from '../message-list/MessageList';
import LoadingRow from '../message/LoadingRow';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';

export default class MainScreen extends React.Component {

  render() {
    const { auth, messages, narrow, fetching, subscriptions,
      caughtUp, isOnline, twentyFourHourTime, doNarrow, fetchOlder, fetchNewer } = this.props;

    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        {!isOnline && <OfflineNotice />}
        {fetching && <LoadingRow />}
        {messages.length === 0 && !fetching && <NoMessages narrow={narrow} />}
        <MessageList
          messages={messages}
          narrow={narrow}
          twentyFourHourTime={twentyFourHourTime}
          subscriptions={subscriptions}
          auth={auth}
          caughtUp={caughtUp}
          fetchOlder={fetchOlder}
          fetchNewer={fetchNewer}
          doNarrow={doNarrow}
        />
        {canSendToNarrow(narrow) && <ComposeBox onSend={this.sendMessage} />}
      </KeyboardAvoidingView>
    );
  }
}
