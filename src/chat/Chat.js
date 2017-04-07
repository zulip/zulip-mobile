import React from 'react';
import {KeyboardAvoidingView} from 'react-native';

import {styles, OfflineNotice} from '../common';
import {canSendToNarrow} from '../utils/narrow';
import MessageList from '../message-list/MessageList';
import NoMessages from '../message/NoMessages';
import ComposeBox from '../compose/ComposeBox';

export default class MainScreen extends React.Component {
  render() {
    const {
      auth,
      messages,
      narrow,
      fetching,
      caughtUp,
      subscriptions,
      isOnline,
      twentyFourHourTime,
      doNarrow,
      fetchOlder,
      fetchNewer,
      markAsRead,
    } = this.props;

    return (
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        {!isOnline && <OfflineNotice />}
        {messages.length === 0 &&
          caughtUp.older &&
          caughtUp.newer &&
          <NoMessages narrow={narrow} />}
        <MessageList
          messages={messages}
          narrow={narrow}
          fetching={fetching}
          caughtUp={caughtUp}
          twentyFourHourTime={twentyFourHourTime}
          subscriptions={subscriptions}
          auth={auth}
          fetchOlder={fetchOlder}
          fetchNewer={fetchNewer}
          doNarrow={doNarrow}
          markAsRead={markAsRead}
        />
        {canSendToNarrow(narrow) && <ComposeBox onSend={this.sendMessage} />}
      </KeyboardAvoidingView>
    );
  }
}
