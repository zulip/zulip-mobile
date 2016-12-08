import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import StreamList from './StreamList';
import { streamNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

class StreamListContainer extends React.Component {

  handleNarrow = (streamName: string) =>
    this.props.onNarrow(streamNarrow(streamName));

  render() {
    return (
      <View tabLabel="Streams" style={styles.container}>
        <StreamList {...this.props} onNarrow={this.handleNarrow} />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamListContainer);
