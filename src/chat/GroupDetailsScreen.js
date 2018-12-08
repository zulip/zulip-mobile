/* @flow */
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Dispatch } from '../types';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = {
  navigation: Object,
  dispatch: Dispatch,
};

class GroupDetailsScreen extends PureComponent<Props> {
  props: Props;

  handlePress = ({ email }) => {
    this.props.dispatch(navigateToAccountDetails(email));
  };

  render() {
    const { recipients } = this.props.navigation.state.params;
    return (
      <Screen title="Recipients" scrollEnabled={false}>
        <FlatList
          initialNumToRender={10}
          data={recipients}
          keyExtractor={item => item.email}
          renderItem={({ item }) => (
            <UserItem
              key={item.email}
              fullName={item.full_name}
              avatarUrl={item.avatar_url}
              email={item.email}
              showEmail
              onPress={this.handlePress}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connect()(GroupDetailsScreen);
