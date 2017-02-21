import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { Screen, SearchInput } from '../common';
import { BRAND_COLOR } from '../common/styles';
import { searchNarrow } from '../utils/narrow';
import MessageList from '../message-list/MessageList';
import { getMessages } from '../api';

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    padding: 8,
    textAlign: 'center',
  },
  results: {
    flex: 1,
  },
  activity: {
    padding: 8,
  }
});

class SearchScreen extends Component {

  props: {
    fullName: string,
    email: string,
    avatarUrl: string,
  }

  state = {
    messages: [],
    isFetching: false,
  };

  handleQueryChange = async (query) => {
    const { auth } = this.props;
    this.query = query;

    throttle(async () => {
      this.setState({ isFetching: true });
      const messages = await getMessages(auth, Number.MAX_SAFE_INTEGER,
        20, 0, searchNarrow(query), false);
      this.setState({
        messages,
        isFetching: false,
      });
    }, 500).call(this);
  }

  render() {
    const { isFetching, messages } = this.state;
    const { auth, subscriptions, twentyFourHourTime } = this.props;
    const noResults = !!this.query && !isFetching && !messages.length;

    return (
      <Screen title="Search messages" keyboardAvoiding>
        <SearchInput onChange={this.handleQueryChange} />
        <View style={styles.results}>
          {isFetching &&
            <ActivityIndicator
              style={styles.activity}
              color={BRAND_COLOR}
              size="large"
            />
          }
          {noResults &&
            <Text style={styles.text}>
              No results
            </Text>
          }
          <MessageList
            messages={messages}
            caughtUp={{ older: true, newer: true }}
            fetching={{ older: false, newer: isFetching }}
            hideFetchingOlder
            narrow={[]}
            twentyFourHourTime={twentyFourHourTime}
            subscriptions={subscriptions}
            auth={auth}
            fetchOlder={() => {}}
            doNarrow={() => {}}
          />
        </View>
      </Screen>
    );
  }
}

export default connect((state) => ({
  auth: getAuth(state),
  isOnline: state.app.isOnline,
  subscriptions: state.subscriptions,
  narrow: state.chat.narrow,
  startReached: state.chat.startReached,
  streamlistOpened: state.nav.opened,
}), boundActions)(SearchScreen);
