/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { getPresence, getUnreadConversations, getUsersByEmail } from '../selectors';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import ConversationList from '../conversations/ConversationList';
import UnreadStreamsContainer from '../unread/UnreadStreamsContainer';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = {
  actions: Actions,
  conversations: Object[],
  presences: Object,
  usersByEmail: Object,
};

class HomeTab extends PureComponent<Props> {
  render() {
    const { actions, conversations, presences, usersByEmail } = this.props;

    return (
      <View style={styles.wrapper}>
        <View style={styles.iconList}>
          <NavButton name="home" onPress={() => actions.doNarrow(homeNarrow)} />
          <NavButton name="star" onPress={() => actions.doNarrow(specialNarrow('starred'))} />
          <NavButton name="at-sign" onPress={() => actions.doNarrow(specialNarrow('mentioned'))} />
          <NavButton name="search" onPress={() => actions.navigateToSearch()} />
        </View>
        <ConversationList
          actions={actions}
          conversations={conversations}
          presences={presences}
          usersByEmail={usersByEmail}
        />
        <UnreadStreamsContainer />
      </View>
    );
  }
}

export default connectWithActions(state => ({
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
}))(HomeTab);
