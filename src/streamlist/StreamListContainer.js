import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

class StreamListContainer extends React.Component {

  handleNarrow = (streamName: string) =>
    this.props.onNarrow(streamNarrow(streamName));

  render() {
    const { narrow, subscriptions } = this.props;
    const selected = isStreamNarrow(narrow) && narrow[0].operand;

    return (
      <ScrollView tabLabel="Streams" style={styles.container}>
        <StreamList
          subscriptions={subscriptions}
          selected={selected}
          onNarrow={this.handleNarrow}
        />
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  narrow: state.chat.narrow,
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamListContainer);
