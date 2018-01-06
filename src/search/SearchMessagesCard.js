/* @noflow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import throttle from 'lodash.throttle';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Actions, Auth, Message } from '../types';
import { SearchEmptyState } from '../common';
import { searchNarrow } from '../utils/narrow';
import MessageList from '../render-native/MessageListScrollView';
import { getMessages } from '../api';
import renderMessages from '../message/renderMessages';

const styles = StyleSheet.create({
  results: {
    flex: 1,
  },
});

type Props = {
  actions: Actions,
  query: string,
  auth: Auth,
};

type State = {
  messages: Message[],
  isFetching: boolean,
  query: string,
};

export default class SearchMessagesCard extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    messages: [],
    isFetching: false,
    query: '',
  };

  handleQueryChange = async (query: string) => {
    const { auth } = this.props;

    throttle(async () => {
      this.setState({ isFetching: true });
      const messages = await getMessages(
        auth,
        searchNarrow(query),
        Number.MAX_SAFE_INTEGER,
        20,
        0,
        false,
      );
      this.setState({
        messages,
        isFetching: false,
      });
    }, 500).call(this);
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.query !== this.props.query) {
      this.handleQueryChange(nextProps.query);
    }
  }

  render() {
    const { isFetching, messages, query } = this.state;
    const { actions } = this.props;
    const noResults = !!query && !isFetching && !messages.length;

    if (noResults) {
      return <SearchEmptyState text="No results" />;
    }

    const renderedMessages = renderMessages(messages, []);

    return (
      <View style={styles.results}>
        <ActionSheetProvider>
          <MessageList
            actions={actions}
            renderedMessages={renderedMessages}
            fetchingOlder={isFetching}
            fetchingNewer={isFetching}
          />
        </ActionSheetProvider>
      </View>
    );
  }
}
