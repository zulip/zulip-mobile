/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Message } from '../types';
import { LoadingIndicator, SearchEmptyState } from '../common';
import { HOME_NARROW } from '../utils/narrow';
import MessageList from '../webview/MessageList';
import renderMessages from '../message/renderMessages';
import { NULL_ARRAY } from '../nullObjects';

const styles = StyleSheet.create({
  results: {
    flex: 1,
  },
});

type Props = {|
  messages: Message[] | null,
  isFetching: boolean,
|};

export default class SearchMessagesCard extends PureComponent<Props> {
  static NOT_FETCHING = { older: false, newer: false };

  render() {
    const { isFetching, messages } = this.props;

    if (isFetching) {
      return <LoadingIndicator size={40} />;
    }

    if (messages === null) {
      return null;
    }

    if (messages.length === 0) {
      return <SearchEmptyState text="No results" />;
    }

    const renderedMessages = renderMessages(messages, []);

    return (
      <View style={styles.results}>
        <ActionSheetProvider>
          <MessageList
            anchor={messages[0].id}
            messages={messages}
            narrow={HOME_NARROW}
            renderedMessages={renderedMessages}
            fetching={SearchMessagesCard.NOT_FETCHING}
            showMessagePlaceholders={false}
            typingUsers={NULL_ARRAY}
          />
        </ActionSheetProvider>
      </View>
    );
  }
}
