/* @flow */
import React, { PureComponent } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import throttle from 'lodash.throttle';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Actions, Auth } from '../types';
import { Label } from '../common';
import { BRAND_COLOR } from '../styles';
import { searchNarrow } from '../utils/narrow';
import MessageList from '../message/MessageList';
import { getMessages } from '../api';

const styles = StyleSheet.create({
  empty: {
    fontSize: 20,
    padding: 8,
    textAlign: 'center',
  },
  results: {
    flex: 1,
  },
  activity: {
    padding: 8,
  },
});

type Props = {
  actions: Actions,
  twentyFourHourTime: boolean,
  subscriptions: any[],
  query: string,
  auth: Auth,
  flags: Object,
};
export default class SearchMessagesCard extends PureComponent {
  props: Props;

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
    const { actions, auth, subscriptions, twentyFourHourTime, flags } = this.props;
    const noResults = !!query && !isFetching && !messages.length;

    return (
      <View style={styles.results}>
        {isFetching &&
          <ActivityIndicator style={styles.activity} color={BRAND_COLOR} size="large" />}
        {noResults && <Label style={styles.empty} text="No results" />}
        <ActionSheetProvider>
          <MessageList
            actions={actions}
            messages={messages}
            caughtUp={{ older: true, newer: true }}
            fetching={{ older: false, newer: isFetching }}
            singleFetchProgress
            narrow={[]}
            twentyFourHourTime={twentyFourHourTime}
            subscriptions={subscriptions}
            auth={auth}
            flags={flags}
          />
        </ActionSheetProvider>
      </View>
    );
  }
}
