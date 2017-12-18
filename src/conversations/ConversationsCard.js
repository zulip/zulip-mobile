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

type Props = {
  actions: Actions,
  conversations: Object[],
  usersByEmail: Object,
  closeDrawer: () => void,
  doNarrowCloseDrawer: (narrow: Narrow) => void,
  closeDrawer: () => void,
};

export default class ConversationsCard extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  handleUserNarrow = (email: string) => {
    const narrow = email.indexOf(',') === -1 ? privateNarrow(email) : groupNarrow(email.split(','));
    this.props.doNarrowCloseDrawer(narrow);
  };

  handleSearchPeople = () => {
    const { actions, closeDrawer } = this.props;
    actions.navigateToUsersScreen();
    closeDrawer();
  };

  render() {
    const { styles } = this.context;
    const { conversations, usersByEmail } = this.props;

    return (
      <View style={[componentStyles.container, styles.background]}>
        <ZulipButton
          secondary
          style={componentStyles.button}
          text="Search people"
          onPress={this.handleSearchPeople}
        />
        <ConversationList
          conversations={conversations}
          usersByEmail={usersByEmail}
          onPress={this.handleUserNarrow}
        />
      </View>
    );
  }
}
