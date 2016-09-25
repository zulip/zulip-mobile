import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

import {
  homeNarrow,
  privateNarrow,
  streamNarrow,
  mentionedNarrow,
  starredNarrow,
} from '../lib/narrow.js';

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
    marginTop: 20,
    marginLeft: 10,
  },
  account: {
    height: NAV_BAR_HEIGHT + STATUS_BAR_HEIGHT,
    backgroundColor: '#222',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  mainMenu: {
    fontWeight: 'bold',
  },
  colorBar: {
    width: 30,
    height: 30,
    margin: 5,
  },
  streamName: {
    padding: 10,
    fontSize: 16,
    color: '#fff',
  }
});

export default class ZulipStreamSidebar extends React.Component {
  renderRow(customStyles, key, onPress, name, color = '#444') {
    return (
      <TouchableWithoutFeedback onPress={onPress} key={key}>
        <View style={styles.row}>
          <View style={[styles.colorBar, { backgroundColor: color }]} />
          <Text style={customStyles}>
            {name}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  render() {
    const subscriptions = this.props.subscriptions.toList().sort((a, b) =>
      a.name.localeCompare(b.name)
    ).map((sub) => {
      return this.renderRow(
        styles.streamName,
        sub.stream_id,
        () => this.props.narrow(streamNarrow(sub.name)),
        sub.name,
        sub.color,
      );
    });
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
            {this.renderRow(
              [styles.streamName, styles.mainMenu],
              -1,
              () => this.props.narrow(homeNarrow),
              'Home',
            )}
            {this.renderRow(
              [styles.streamName, styles.mainMenu],
              -2,
              () => this.props.narrow(privateNarrow()),
              'Private Messages',
            )}
            {this.renderRow(
              [styles.streamName, styles.mainMenu],
              -3,
              () => this.props.narrow(starredNarrow),
              'Starred',
            )}
            {this.renderRow(
              [styles.streamName, styles.mainMenu],
              -4,
              () => this.props.narrow(mentionedNarrow),
              '@-Mentions',
            )}
            {subscriptions}
          </View>
        </ScrollView>
      </View>
    );
  }
};
