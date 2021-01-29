/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot, UserId } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'group-details'>,
  route: RouteProp<'group-details', {| recipients: $ReadOnlyArray<UserId> |}>,

  dispatch: Dispatch,
|}>;

class GroupDetailsScreen extends PureComponent<Props> {
  handlePress = (user: UserOrBot) => {
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  };

  render() {
    const { recipients } = this.props.route.params;
    return (
      <Screen title="Recipients" scrollEnabled={false}>
        <FlatList
          initialNumToRender={10}
          data={recipients}
          keyExtractor={item => String(item)}
          renderItem={({ item }) => (
            <UserItem key={item} userId={item} showEmail onPress={this.handlePress} />
          )}
        />
      </Screen>
    );
  }
}

export default connect<{||}, _, _>()(GroupDetailsScreen);
