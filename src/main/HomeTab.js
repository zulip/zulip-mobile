/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import UnreadContainer from '../unread/UnreadContainer';

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
    const { actions } = this.props;

    return (
      <View style={styles.wrapper}>
        <View style={styles.iconList}>
          <NavButton name="home" onPress={() => actions.doNarrow(homeNarrow)} />
          <NavButton name="star" onPress={() => actions.doNarrow(specialNarrow('starred'))} />
          <NavButton name="at-sign" onPress={() => actions.doNarrow(specialNarrow('mentioned'))} />
          <NavButton name="search" onPress={() => actions.navigateToSearch()} />
        </View>
        <UnreadContainer />
      </View>
    );
  }
}

export default connectWithActions(null)(HomeTab);
