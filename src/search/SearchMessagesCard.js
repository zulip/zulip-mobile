/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Message, Narrow } from '../types';
import { createStyleSheet } from '../styles';
import LoadingIndicator from '../common/LoadingIndicator';
import SearchEmptyState from '../common/SearchEmptyState';
import MessageListWrapper from './MessageListWrapper';

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
    const { isFetching, messages, narrow } = this.props;
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
        <MessageListWrapper messages={messages} narrow={narrow} />
      </View>
    );
  }
}
