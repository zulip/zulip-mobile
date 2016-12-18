import React, { Component } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Screen, SearchInput } from '../common';
import MessageList from '../message-list/MessageList';

class SearchScreen extends Component {

  props: {
    fullName: string,
    email: string,
    avatarUrl: string,
  }

  render() {
    return (
      <Screen title="Account Details">
        <SearchInput />
        <MessageList />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
  }),
  boundActions,
)(SearchScreen);
