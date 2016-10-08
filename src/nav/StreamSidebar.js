import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {
  homeNarrow,
  privateNarrow,
  streamNarrow,
  mentionedNarrow,
  starredNarrow,
} from '../lib/narrow';

import SidebarRow from './SidebarRow';

const NAV_BAR_HEIGHT = 44;
const STATUS_BAR_HEIGHT = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#444',
  },
  streams: {
    flex: 1,
    flexDirection: 'column',
  },
  account: {
    height: NAV_BAR_HEIGHT + STATUS_BAR_HEIGHT,
    backgroundColor: '#222',
  },
  mainMenu: {
    fontWeight: 'bold',
  },
  colorBar: {
    width: 30,
    height: 30,
    margin: 5,
  },
  icon: {
    width: 30,
    height: 30,
    margin: 5,
    fontSize: 30,
    color: '#fff',
    textAlign: 'center',
  },
  streamName: {
    padding: 10,
    fontSize: 16,
    color: '#fff',
  },
});

export default class StreamSidebar extends React.Component {

  render() {
    const sortedSubscriptions = this.props.subscriptions.toList()
      .sort((a, b) => a.get('name').localeCompare(b.get('name')));

    return (
      <View style={styles.container}>
        <Text
          style={styles.account}
          onPress={this.props.logout}
        />
        <ScrollView
          scrollsToTop={false}
        >
          <View style={styles.streams}>
            <SidebarRow
              name="Home"
              customStyles={[styles.streamName, styles.mainMenu]}
              onPress={() => this.props.narrow(homeNarrow)}
              icon={<Icon style={styles.icon} name="md-home" />}
            />
            <SidebarRow
              name="Private Messages"
              customStyles={[styles.streamName, styles.mainMenu]}
              onPress={() => this.props.narrow(privateNarrow())}
              icon={<Icon style={styles.icon} name="md-chatboxes" />}
            />
            <SidebarRow
              name="Starred"
              customStyles={[styles.streamName, styles.mainMenu]}
              onPress={() => this.props.narrow(starredNarrow)}
              icon={<Icon style={styles.icon} name="md-star" />}
            />
            <SidebarRow
              name="@-mentions"
              customStyles={[styles.streamName, styles.mainMenu]}
              onPress={() => this.props.narrow(mentionedNarrow)}
              icon={<Icon style={styles.icon} name="md-at" />}
            />
            {sortedSubscriptions.map(x =>
              <SidebarRow
                key={x.get('stream_id')}
                name={x.get('name')}
                customStyles={styles.streamName}
                onPress={() => this.props.narrow(streamNarrow(x.get('name')))}
                icon={<View style={[styles.colorBar, { backgroundColor: x.get('color') }]} />}
              />
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}
