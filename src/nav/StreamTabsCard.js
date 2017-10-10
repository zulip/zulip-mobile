/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import connectWithActions from '../connectWithActions';
import type { Actions, Narrow } from '../types';
import { homeNarrow, specialNarrow, allPrivateNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import StreamTabs from './StreamTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

type Props = {
  actions: Actions,
  doNarrowCloseDrawer: (narrow: Narrow) => void,
};

class StreamTabsCard extends PureComponent<Props> {
  props: Props;

  render() {
    const { actions, doNarrowCloseDrawer } = this.props;

    return (
      <View style={componentStyles.container}>
        <View style={componentStyles.iconList}>
          <NavButton name="md-home" onPress={() => doNarrowCloseDrawer(homeNarrow)} />
          <NavButton name="md-mail" onPress={() => doNarrowCloseDrawer(allPrivateNarrow)} />
          <NavButton name="md-star" onPress={() => doNarrowCloseDrawer(specialNarrow('starred'))} />
          <NavButton name="md-at" onPress={() => doNarrowCloseDrawer(specialNarrow('mentioned'))} />
          <NavButton name="md-search" onPress={actions.navigateToSearch} />
        </View>
        <StreamTabs screenProps={{ doNarrowCloseDrawer }} />
      </View>
    );
  }
}

export default connectWithActions(null)(StreamTabsCard);
