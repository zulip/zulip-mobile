/* @flow strict-local */
import React, { PureComponent } from 'react';

import * as api from '../api';
import type { Auth, Dispatch, Message } from '../types';
import { Screen } from '../common';
import SearchMessagesCard from './SearchMessagesCard';
import styles from '../styles';
import { SEARCH_NARROW } from '../utils/narrow';
import { LAST_MESSAGE_ANCHOR } from '../constants';
import { connect } from '../react-redux';
import { getAuth } from '../account/accountsSelectors';

type Props = {|
  auth: Auth,
  dispatch: Dispatch,
|};

type State = {|
  query: string,
  messages: Message[],
  isFetching: boolean,
|};

class SearchMessagesScreen extends PureComponent<Props, State> {
  state = {
    query: '',
    messages: [],
    isFetching: false,
  };

  performQuery = async (query: string) => {
    const { auth } = this.props;

    this.setState({ isFetching: true });

    const { messages } = await api.getMessages(
      auth,
      SEARCH_NARROW(query),
      LAST_MESSAGE_ANCHOR,
      20,
      0,
      false,
    );

    this.setState({ messages, isFetching: false });
  };

  handleQueryChange = (query: string) => {
    this.setState({ query });
    this.performQuery(query);
  };

  render() {
    const { query, messages, isFetching } = this.state;

    return (
      <Screen search autoFocus searchBarOnChange={this.handleQueryChange} style={styles.flexed}>
        <SearchMessagesCard
          queryIsEmpty={query === ''}
          messages={messages}
          isFetching={isFetching}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
}))(SearchMessagesScreen);
