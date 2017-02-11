import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { BRAND_COLOR } from '../common/styles';
import SidebarRow from '../nav/SidebarRow';

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    backgroundColor: BRAND_COLOR,
  },
});

export default class HomeTab extends React.Component {
  render() {
    return (
      <View tabLabel="Home">
        <SidebarRow
          name="All Messages"
          customStyles={[styles.streamName, styles.mainMenu]}
          icon="md-home"
        />
        <SidebarRow
          name="Private Messages"
          customStyles={[styles.streamName, styles.mainMenu]}
          icon="md-chatboxes"
        />
        <SidebarRow
          name="Starred"
          customStyles={[styles.streamName, styles.mainMenu]}
          icon="md-star"
        />
        <SidebarRow
          name="Mentions"
          customStyles={[styles.streamName, styles.mainMenu]}
          icon="md-at"
        />
      </View>
    );
  }
}
