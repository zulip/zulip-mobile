/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import StreamTabs from './StreamTabs';

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type Props = {
  doNarrowCloseDrawer: (narrow: Narrow) => void,
};

class StreamTabsCard extends PureComponent<Props> {
  props: Props;

  render() {
    const { doNarrowCloseDrawer } = this.props;

    return (
      <View style={componentStyles.container}>
        <StreamTabs screenProps={{ doNarrowCloseDrawer }} />
      </View>
    );
  }
}

export default StreamTabsCard;
