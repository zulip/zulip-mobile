import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

class SubscriptionsContainer extends React.Component {

  handleNarrow = (streamName: string) =>
    this.props.onNarrow(streamNarrow(streamName));

  render() {
    const { narrow, subscriptions, streams } = this.props;
    const subscribedStreams = streams.filter(x =>
      subscriptions.some(s => s.stream_id === x.stream_id));
    const streamsList = subscribedStreams.map(x => ({
      ...x,
      color: subscriptions.find(s => s.stream_id === x.stream_id).color,
    }));
    const selected = isStreamNarrow(narrow) && narrow[0].operand;
    return (
      <View tabLabel="Streams" style={styles.container}>
        <StreamList
          streams={streamsList}
          selected={selected}
          onNarrow={this.handleNarrow}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  narrow: state.chat.narrow,
  subscriptions: state.subscriptions,
  streams: state.streams,
});

export default connect(mapStateToProps)(SubscriptionsContainer);
