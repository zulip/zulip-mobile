import React from 'react';
import { StyleSheet, View } from 'react-native';

import { STATUSBAR_HEIGHT } from '../styles';
import { ZulipButton } from '../common';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import NavButton from './NavButton';
import SubscriptionsContainer from '../streamlist/SubscriptionsContainer';

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

export default class StreamSidebar extends React.Component {

  render() {
    const { navigateToSearch, navigateToAllStreams, navigateToSettings, onNarrow } = this.props;

    return (
      <View style={styles.container} scrollsToTop={false}>
        <View style={styles.iconList}>
          <NavButton
            name="md-home"
            onPress={() => onNarrow(homeNarrow())}
          />
          <NavButton
            name="md-mail"
            onPress={() => onNarrow(specialNarrow('private'))}
          />
          <NavButton
            name="md-star"
            onPress={() => onNarrow(specialNarrow('starred'))}
          />
          <NavButton
            name="md-at"
            onPress={() => onNarrow(specialNarrow('mentioned'))}
          />
          <NavButton
            name="md-search"
            onPress={navigateToSearch}
          />
          <NavButton
            name="md-settings"
            onPress={navigateToSettings}
          />
        </View>
        <SubscriptionsContainer onNarrow={onNarrow} />
        <ZulipButton
          style={styles.button}
          secondary
          text="All streams"
          onPress={navigateToAllStreams}
        />
      </View>
    );
  }
}
