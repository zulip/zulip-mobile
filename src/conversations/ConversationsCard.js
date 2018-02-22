/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions } from '../types';
import { Label, ZulipButton } from '../common';
import ConversationList from './ConversationList';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 8,
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
  },
});

type Props = {
  actions: Actions,
  conversations: Object[],
  presences: Object,
  usersByEmail: Object,
};

export default class ConversationsCard extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleSearchPeople = () => {
    const { actions } = this.props;
    actions.navigateToUsersScreen();
  };

  render() {
    const { styles } = this.context;
    const { actions, conversations, presences, usersByEmail } = this.props;

    return (
      <View style={[componentStyles.container, styles.background]}>
        <ZulipButton
          secondary
          style={componentStyles.button}
          text="Search people"
          onPress={this.handleSearchPeople}
        />
        {conversations.length === 0 ? (
          <Label style={componentStyles.emptySlate} text="No recent conversations" />
        ) : (
          <ConversationList
            actions={actions}
            conversations={conversations}
            presences={presences}
            usersByEmail={usersByEmail}
          />
        )}
      </View>
    );
  }
}
