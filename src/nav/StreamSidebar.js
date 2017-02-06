import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ZulipButton } from '../common';
import { STATUSBAR_HEIGHT } from '../common/platform';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import SidebarRow from './SidebarRow';
import SubscriptionsContainer from '../streamlist/SubscriptionsContainer';

const styles = StyleSheet.create({
  container: {
    marginTop: STATUSBAR_HEIGHT,
    flex: 1,
    flexDirection: 'column',
  },
  streams: {
    flexDirection: 'column',
  },
  button: {
    margin: 8,
  }
});

export default class StreamSidebar extends React.Component {

  handleAllStreams = () =>
    this.props.pushRoute('subscriptions');

  render() {
    const { onNarrow } = this.props;

    return (
      <View style={styles.container} scrollsToTop={false}>
        <SidebarRow
          name="Home"
          icon="md-home"
          onPress={() => onNarrow(homeNarrow())}
        />
        <SidebarRow
          name="Private Messages"
          icon="md-chatboxes"
          onPress={() => onNarrow(specialNarrow('private'))}
        />
        <SidebarRow
          name="Starred"
          icon="md-star"
          onPress={() => onNarrow(specialNarrow('starred'))}
        />
        <SidebarRow
          name="Mentions"
          icon="md-at"
          onPress={() => onNarrow(specialNarrow('mentioned'))}
        />
        <SubscriptionsContainer onNarrow={onNarrow} />
        <ZulipButton
          customStyles={styles.button}
          secondary
          text="All Streams"
          onPress={this.handleAllStreams}
        />
      </View>
    );
  }
}
