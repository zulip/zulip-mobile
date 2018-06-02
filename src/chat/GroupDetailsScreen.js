/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { BRAND_COLOR } from '../styles';

type Props = {
  navigation: Object,
  actions: Actions,
};

class GroupDetailsScreen extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  handlePress = (email: string) => {
    const { actions } = this.props;
    actions.navigateToAccountDetails(email);
  };

  render() {
    const { navigation } = this.props;
    const { recipients } = navigation.state.params;
    const title = {
      text: '{_}',
      values: {
        _: 'Recipients',
      },
    };

    return (
      <Screen title={title}>
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
              onPress={() => this.handlePress(item.email)}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connectWithActions(null)(GroupDetailsScreen);
