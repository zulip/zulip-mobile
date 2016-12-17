import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';

import { STATUSBAR_HEIGHT } from '../common/platform';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import SidebarRow from './SidebarRow';
import StreamListContainer from '../streamlist/StreamListContainer';

const styles = StyleSheet.create({
  container: {
    marginTop: STATUSBAR_HEIGHT,
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
    const { onNarrow } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.streams}
          scrollsToTop={false}
        >
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
          <StreamListContainer onNarrow={onNarrow} />
        </ScrollView>
      </View>
    );
  }
}
