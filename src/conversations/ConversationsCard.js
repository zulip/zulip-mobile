/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions } from '../types';
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
  presences: Object,
  usersByEmail: Object,
};

export default class ConversationsCard extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  handleUserNarrow = (email: string) => {
    const narrow = email.indexOf(',') === -1 ? privateNarrow(email) : groupNarrow(email.split(','));
    this.props.actions.doNarrow(narrow);
  };

  handleSearchPeople = () => {
    const { actions } = this.props;
    actions.navigateToUsersScreen();
  };

  render() {
    const { styles } = this.context;
    const { conversations, presences, usersByEmail } = this.props;

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
          presences={presences}
          usersByEmail={usersByEmail}
          onPress={this.handleUserNarrow}
        />
      </View>
    );
  }
}
