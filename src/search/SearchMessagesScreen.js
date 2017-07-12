/* @flow */
import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Actions, Auth } from '../types';
import boundActions from '../boundActions';
import { Label } from '../common';
import { getAuth } from '../account/accountSelectors';
import SearchScreen from './SearchScreen';
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

class SearchMessagesScreen extends Component {
  query: string;

  props: {
    actions: Actions,
    twentyFourHourTime: boolean,
    subscriptions: any[],
    auth: Auth,
    flags: Object,
  };

  state = {
    messages: [],
    isFetching: false,
  };

  handleQueryChange = async (query: string) => {
    const { auth } = this.props;
    this.query = query;

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

  render() {
    const { isFetching, messages } = this.state;
    const { actions, auth, subscriptions, twentyFourHourTime, flags } = this.props;
    const noResults = !!this.query && !isFetching && !messages.length;

    return (
      <SearchScreen title="Search" keyboardAvoiding searchBarOnChange={this.handleQueryChange}>
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
      </SearchScreen>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    isOnline: state.app.isOnline,
    subscriptions: state.subscriptions,
    narrow: state.chat.narrow,
    startReached: state.chat.startReached,
    streamlistOpened: state.nav.opened,
    flags: state.flags,
  }),
  boundActions,
)(SearchMessagesScreen);
