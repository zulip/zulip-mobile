/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Message, Narrow } from '../types';
import { createStyleSheet } from '../styles';
import LoadingIndicator from '../common/LoadingIndicator';
import SearchEmptyState from '../common/SearchEmptyState';
import MessageList from '../webview/MessageList';

const styles = createStyleSheet({
  results: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  messages: $ReadOnlyArray<Message> | null,
  narrow: Narrow,
  isFetching: boolean,
|}>;

export default class SearchMessagesCard extends PureComponent<Props> {
  render(): Node {
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

    return (
      <View style={styles.results}>
        <MessageList
          initialScrollMessageId={
            // This access is OK only because of the `.length === 0` check
            // above.
            messages[messages.length - 1].id
          }
          messages={messages}
          narrow={this.props.narrow}
          showMessagePlaceholders={false}
          // TODO: handle editing a message from the search results,
          // or make this prop optional
          startEditMessage={() => undefined}
        />
      </View>
    );
  }
}
