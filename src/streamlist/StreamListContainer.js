import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import StreamList from './StreamList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

class StreamListContainer extends React.Component {
  render() {
    return (
      <View tabLabel="Streams" style={styles.container}>
        <StreamList {...this.props} />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  subscriptions: state.subscriptions,
});

export default connect(mapStateToProps)(StreamListContainer);
