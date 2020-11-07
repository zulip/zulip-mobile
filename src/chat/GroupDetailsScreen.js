/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { UserItemById } from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: AppNavigationProp<'group-details'>,

  dispatch: Dispatch,
|}>;

class GroupDetailsScreen extends PureComponent<Props> {
  handlePress = (user: UserOrBot) => {
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  };

  render() {
    const { recipients } = this.props.navigation.state.params;
    return (
      <Screen title="Recipients" scrollEnabled={false}>
        <FlatList
          initialNumToRender={10}
          data={recipients}
          keyExtractor={item => String(item)}
          renderItem={({ item }) => (
            <UserItemById key={item} userId={item} showEmail onPress={this.handlePress} />
          )}
        />
      </Screen>
    );
  }
}

export default connect<{||}, _, _>()(GroupDetailsScreen);
