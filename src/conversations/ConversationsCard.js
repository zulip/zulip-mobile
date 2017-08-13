/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import { STATUSBAR_HEIGHT } from '../styles';
import type { Actions } from '../types';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import { ZulipButton } from '../common';
import ConversationList from './ConversationList';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: STATUSBAR_HEIGHT,
  },
  accountButtons: {
    flexDirection: 'row',
  },
  button: {
    margin: 8,
  },
});

export default class ConversationsCard extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    actions: Actions,
    conversations: Object[],
    usersNavigation: Object,
  };

  state = {
    filter: '',
  };

  handleFilterChange = (newFilter: string) => {
    this.setState({
      filter: newFilter,
    });
  };

  handleUserNarrow = (email: string) => {
    const { actions, usersNavigation } = this.props;
    const narrow = email.indexOf(',') === -1 ? privateNarrow(email) : groupNarrow(email.split(','));
    actions.doNarrow(narrow);
    usersNavigation.navigate('DrawerClose');
  };

  handleSearchPeople = () => {
    const { actions, usersNavigation } = this.props;
    actions.navigateToUsersScreen();
    usersNavigation.navigate('DrawerClose');
  };

  render() {
    const { styles } = this.context;
    const { conversations } = this.props;

    return (
      <View style={[componentStyles.container, styles.background]}>
        <ZulipButton
          secondary
          style={componentStyles.button}
          text="Search people"
          onPress={this.handleSearchPeople}
        />
        <ConversationList conversations={conversations} onPress={this.handleUserNarrow} />
        <View style={componentStyles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </View>
    );
  }
}
