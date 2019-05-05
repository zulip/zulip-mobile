/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import type { Dispatch, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = {|
  navigation: NavigationScreenProp<{ params: {| recipients: UserOrBot[] |} }>,
  dispatch: Dispatch,
|};

class GroupDetailsScreen extends PureComponent<Props> {
  handlePress = (email: string) => {
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
