import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import {
  homeNarrow,
  privateNarrow,
  mentionedNarrow,
  starredNarrow,
} from '../utils/narrow';
import SidebarRow from './SidebarRow';
import StreamListContainer from '../streamlist/StreamListContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  streams: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default class StreamSidebar extends React.Component {

  render() {
    const { narrow } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.streams}
          scrollsToTop={false}
        >
          <SidebarRow
            name="Home"
            icon="md-home"
            onPress={() => narrow(homeNarrow)}
          />
          <SidebarRow
            name="Private Messages"
            icon="md-chatboxes"
            onPress={() => narrow(privateNarrow())}
          />
          <SidebarRow
            name="Starred"
            icon="md-star"
            onPress={() => narrow(starredNarrow)}
          />
          <SidebarRow
            name="Mentions"
            icon="md-at"
            onPress={() => narrow(mentionedNarrow)}
          />
          <StreamListContainer narrow={narrow} />
        </ScrollView>
      </View>
    );
  }
}
