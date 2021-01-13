/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Message } from '../types';
import { createStyleSheet } from '../styles';
import { LoadingIndicator, SearchEmptyState } from '../common';
import { HOME_NARROW } from '../utils/narrow';
import MessageList from '../webview/MessageList';
import getHtmlPieceDescriptors from '../message/getHtmlPieceDescriptors';
import { NULL_ARRAY } from '../nullObjects';

const styles = createStyleSheet({
  results: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  messages: Message[] | null,
  isFetching: boolean,
|}>;

export default class SearchMessagesCard extends PureComponent<Props> {
  static NOT_FETCHING = { older: false, newer: false };

  render() {
    const { isFetching, messages } = this.props;

    if (isFetching) {
      // Display loading indicator only if there are no messages to
      // display from a previous search.
      if (!messages || messages.length === 0) {
        return <LoadingIndicator size={40} />;
      }
    }

    if (!messages) {
      return null;
    }

    if (messages.length === 0) {
      return <SearchEmptyState text="No results" />;
    }

    const renderedMessages = getHtmlPieceDescriptors(messages, HOME_NARROW);

    return (
      <View style={styles.results}>
        <ActionSheetProvider>
          <MessageList
            initialScrollMessageId={messages[0].id}
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
