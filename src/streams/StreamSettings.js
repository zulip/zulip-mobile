/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, SectionList, StyleSheet } from 'react-native';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { Screen, Label, RawLabel } from '../common';
import UserItem from '../users/UserItem';
import { BRAND_COLOR } from '../styles';
import { NULL_SUBSCRIPTION } from '../nullObjects';
import { getSubscribedStreams } from '../selectors';
import {
  getUsersListFromEmails,
  sortAlphabetically,
  getAllActiveUsersWithStatus,
  groupUsersByInitials,
} from '../users/userSelectors';

const componentStyles = StyleSheet.create({
  heading: {
    color: BRAND_COLOR,
    margin: 8,
    fontWeight: 'bold',
  },
  wrapper: {
    flex: 1,
    marginTop: 8,
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
  },
});

class StreamSettings extends PureComponent {
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
    const { navigation, subscriptions, users } = this.props;
    const { streamId } = navigation.state.params;
    const membersEmail = (subscriptions.find(stream => stream.stream_id === streamId) ||
      NULL_SUBSCRIPTION).subscribers;
    const members = groupUsersByInitials(
      sortAlphabetically(getUsersListFromEmails(membersEmail, users)),
    );
    const sections = Object.keys(members).map(key => ({ key, data: members[key] }));
    const title = {
      text: '{_}',
      values: {
        _: 'Stream details',
      },
    };

    return (
      <Screen title={title}>
        <View style={componentStyles.wrapper}>
          <View style={this.context.styles.cardView}>
            <Label style={componentStyles.heading} text="Members" />
            <SectionList
              initialNumToRender={20}
              sections={sections}
              keyExtractor={item => item.email}
              renderItem={({ item }) =>
                <UserItem
                  key={item.email}
                  fullName={item.fullName}
                  avatarUrl={item.avatarUrl}
                  email={item.email}
                  showEmail
                  onPress={() => this.handlePress(item.email)}
                />}
              renderSectionHeader={({ section }) =>
                <RawLabel style={componentStyles.groupHeader} text={section.key} />}
            />
          </View>
        </View>
      </Screen>
    );
  }
}

export default connect(
  state => ({
    subscriptions: getSubscribedStreams(state),
    users: getAllActiveUsersWithStatus(state),
  }),
  boundActions,
)(StreamSettings);
