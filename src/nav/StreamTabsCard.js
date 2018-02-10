/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import StreamTabs from './StreamTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconList: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

type Props = {
  actions: Actions,
};

class StreamTabsCard extends PureComponent<Props> {
  props: Props;

  render() {
    const { actions } = this.props;

    return (
      <View style={componentStyles.container}>
        <View style={componentStyles.iconList}>
          <NavButton name="home" onPress={() => actions.doNarrow(homeNarrow)} />
          <NavButton name="star" onPress={() => actions.doNarrow(specialNarrow('starred'))} />
          <NavButton name="at-sign" onPress={() => actions.doNarrow(specialNarrow('mentioned'))} />
          <NavButton name="search" onPress={() => actions.navigateToSearch()} />
        </View>
        <StreamTabs />
      </View>
    );
  }
}

export default connectWithActions(null)(StreamTabsCard);
