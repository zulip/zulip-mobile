/* @flow */
import React, { PureComponent } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import throttle from 'lodash.throttle';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Actions, Auth } from '../types';
import { SearchEmptyState } from '../common';
import { BRAND_COLOR } from '../styles';
import { searchNarrow } from '../utils/narrow';
import MessageList from '../message/MessageList';
import { getMessages } from '../api';
import renderMessages from '../message/renderMessages';

const styles = StyleSheet.create({
  results: {
    flex: 1,
  },
  activity: {
    padding: 8,
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
        Number.MAX_SAFE_INTEGER,
        20,
        0,
        searchNarrow(query),
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
        {isFetching && (
          <ActivityIndicator style={styles.activity} color={BRAND_COLOR} size="large" />
        )}
        <ActionSheetProvider>
          <MessageList
            actions={actions}
            renderedMessages={renderedMessages}
            fetchingOlder={false}
            fetchingNewer={isFetching}
            caughtUpOlder
            caughtUpNewer
            singleFetchProgress
          />
        </ActionSheetProvider>
      </View>
    );
  }
}
