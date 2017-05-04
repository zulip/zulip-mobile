/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Actions } from '../types';
import boundActions from '../boundActions';
import { STATUSBAR_HEIGHT } from '../styles';
import { ZulipButton } from '../common';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import SubscriptionsContainer from '../streams/SubscriptionsContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
    flexDirection: 'column',
  },
  iconList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    margin: 8,
  },
});

class StreamSidebar extends PureComponent {
  props: {
    actions: Actions,
    onNarrow: () => void,
  };

  render() {
    const { actions, onNarrow } = this.props;

    return (
      <View style={styles.container} scrollsToTop={false}>
        <View style={styles.iconList}>
          <NavButton name="md-home" onPress={() => actions.doNarrow(homeNarrow())} />
          <NavButton name="md-mail" onPress={() => actions.doNarrow(specialNarrow('private'))} />
          <NavButton name="md-star" onPress={() => actions.doNarrow(specialNarrow('starred'))} />
          <NavButton name="md-at" onPress={() => actions.doNarrow(specialNarrow('mentioned'))} />
          <NavButton name="md-search" onPress={actions.navigateToSearch} />
          <NavButton name="md-settings" onPress={actions.navigateToSettings} />
        </View>
        <SubscriptionsContainer onNarrow={onNarrow} />
        <ZulipButton
          style={styles.button}
          secondary
          text="All streams"
          onPress={actions.navigateToAllStreams}
        />
      </View>
    );
  }
}

export default connect(null, boundActions)(StreamSidebar);
