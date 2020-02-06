/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import type { Dispatch, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<{|
    ...NavigationStateRoute,
    params: {| recipients: UserOrBot[] |},
  |}>,

  dispatch: Dispatch,
|}>;

class GroupDetailsScreen extends PureComponent<Props> {
  handlePress = (userId: number) => {
    this.props.dispatch(navigateToAccountDetails(userId));
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
              key={item.user_id}
              user={item}
              showEmail
              onPress={() => {
                this.handlePress(item.user_id);
              }}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connect<{||}, _, _>()(GroupDetailsScreen);
