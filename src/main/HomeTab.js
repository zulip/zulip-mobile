/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from '../nav/NavButton';
import UnreadStreamsContainer from '../unread/UnreadStreamsContainer';

const componentStyles = StyleSheet.create({
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = {
  actions: Actions,
};

class HomeTab extends PureComponent<Props> {
  render() {
    const { actions } = this.props;

    return (
      <View>
        <View style={componentStyles.iconList}>
          <NavButton name="home" onPress={() => actions.doNarrow(homeNarrow)} />
          <NavButton name="star" onPress={() => actions.doNarrow(specialNarrow('starred'))} />
          <NavButton name="at-sign" onPress={() => actions.doNarrow(specialNarrow('mentioned'))} />
          <NavButton name="search" onPress={() => actions.navigateToSearch()} />
        </View>
        <UnreadStreamsContainer />
      </View>
    );
  }
}

export default connectWithActions(null)(HomeTab);
