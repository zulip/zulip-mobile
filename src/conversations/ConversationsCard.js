/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, Narrow } from '../types';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import { ZulipButton } from '../common';
import ConversationList from './ConversationList';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
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
    doNarrowCloseDrawer: (narrow: Narrow) => void,
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
    const narrow = email.indexOf(',') === -1 ? privateNarrow(email) : groupNarrow(email.split(','));
    this.props.doNarrowCloseDrawer(narrow);
  };

  handleSearchPeople = () => {
    const { actions } = this.props;
    actions.navigateToUsersScreen();
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
      </View>
    );
  }
}
