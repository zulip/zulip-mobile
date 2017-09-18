/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, FlatList, StyleSheet } from 'react-native';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { Screen, Label } from '../common';
import UserItem from '../users/UserItem';
import { BRAND_COLOR } from '../styles';

const componentStyles = StyleSheet.create({
  heading: {
    color: BRAND_COLOR,
    margin: 8,
    fontWeight: 'bold',
  },
});

class GroupDetailsScreen extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    navigation: Object,
    actions: Actions,
  };

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
        _: 'Group details',
      },
    };

    return (
      <Screen title={title}>
        <View style={this.context.styles.cardView}>
          <Label style={componentStyles.heading} text="Members" />
          <FlatList
            initialNumToRender={10}
            data={recipients}
            keyExtractor={item => item.email}
            renderItem={({ item }) => (
              <UserItem
                key={item.email}
                fullName={item.fullName}
                avatarUrl={item.avatarUrl}
                email={item.email}
                showEmail
                onPress={() => this.handlePress(item.email)}
              />
            )}
          />
        </View>
      </Screen>
    );
  }
}

export default connect(null, boundActions)(GroupDetailsScreen);
