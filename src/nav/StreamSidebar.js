import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ZulipButton } from '../common';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import SidebarRow from './SidebarRow';
import SubscriptionsContainer from '../streamlist/SubscriptionsContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  streams: {
    flexDirection: 'column',
  },
  button: {
    margin: 8,
  },
});

export default class StreamSidebar extends React.Component {

  handleAllStreams = () =>
    this.props.pushRoute('subscriptions');

  handleSearch = (narrow) => {
    const { pushRoute } = this.props;
    pushRoute('search');
  };

  handleAbout = () => {
    const { pushRoute } = this.props;
    pushRoute('about');
  };

  render() {
    const { onNarrow } = this.props;

    return (
      <View style={styles.container} scrollsToTop={false}>
        <ZulipButton
          secondary
          customStyles={styles.button}
          text="Search messages"
          onPress={this.handleSearch}
        />
        <SidebarRow
          name="Home"
          icon="md-home"
          onPress={() => onNarrow(homeNarrow())}
        />
        <SidebarRow
          name="Private messages"
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
        <SidebarRow
          name="About"
          icon="md-information-circle"
          onPress={this.handleAbout}
        />
        <SubscriptionsContainer onNarrow={onNarrow} />
        <ZulipButton
          customStyles={styles.button}
          secondary
          text="All streams"
          onPress={this.handleAllStreams}
        />
      </View>
    );
  }
}
