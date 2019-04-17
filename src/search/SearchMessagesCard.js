/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import throttle from 'lodash.throttle';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import type { Auth, Message, Dispatch } from '../types';
import { connect } from '../react-redux';
import { LoadingIndicator, SearchEmptyState } from '../common';
import { HOME_NARROW, SEARCH_NARROW } from '../utils/narrow';
import MessageList from '../webview/MessageList';
import { getMessages } from '../api';
import renderMessages from '../message/renderMessages';
import { NULL_ARRAY } from '../nullObjects';
import { getAuth } from '../selectors';
import { LAST_MESSAGE_ANCHOR } from '../constants';

const styles = StyleSheet.create({
  results: {
    flex: 1,
  },
});

type Props = {|
  dispatch: Dispatch,
  auth: Auth,
  query: string,
|};

type State = {|
  messages: Message[],
  isFetching: boolean,
|};

class SearchMessagesCard extends PureComponent<Props, State> {
  state = {
    messages: [],
    isFetching: false,
  };

  handleQueryChange = async (query: string) => {
    const { auth } = this.props;

    throttle(async () => {
      this.setState({ isFetching: true });
      const { messages } = await getMessages(
        auth,
        SEARCH_NARROW(query),
        LAST_MESSAGE_ANCHOR,
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

  componentDidUpdate(prevProps: Props) {
    if (prevProps.query !== this.props.query) {
      this.handleQueryChange(this.props.query);
    }
  }

  static NOT_FETCHING = { older: false, newer: false };

  render() {
    const { isFetching, messages } = this.state;
    const { query } = this.props;

    if (isFetching) {
      return <LoadingIndicator size={40} />;
    }

    if (messages.length === 0) {
      return query.length > 0 ? <SearchEmptyState text="No results" /> : null;
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

export default connect(state => ({
  auth: getAuth(state),
}))(SearchMessagesCard);
