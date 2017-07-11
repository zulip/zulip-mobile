/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import SearchScreen from '../search/SearchScreen';
import { getAuth } from '../account/accountSelectors';
import { getRecentConversations } from '../chat/chatSelectors';
import UserListCard from './UserListCard';

class UsersScreen extends Component {

  state: {
    filter: string,
  };

  constructor() {
    super();
    this.state = {
      filter: '',
    };
  }

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { filter } = this.state;
    return (
      <SearchScreen
        title="Search people"
        searchBarOnChange={this.handleFilterChange}
        searchBar
      >
        <UserListCard {...this.props} filter={filter} />
      </SearchScreen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    ownEmail: getAuth(state).email,
    realm: getAuth(state).realm,
    users: state.users,
    conversations: getRecentConversations(state),
  }),
  boundActions
)(UsersScreen);
