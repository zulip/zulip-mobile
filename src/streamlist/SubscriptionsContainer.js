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
    const { narrow, subscriptions } = this.props;
    const selected = isStreamNarrow(narrow) && narrow[0].operand;

    return (
      <View tabLabel="Streams" style={styles.container}>
        <StreamList
          streams={subscriptions}
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
});

export default connect(mapStateToProps)(SubscriptionsContainer);
