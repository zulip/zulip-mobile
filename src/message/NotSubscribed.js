/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Narrow, Stream } from '../types';
import boundActions from '../boundActions';
import { subscriptionAdd } from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth } from '../account/accountSelectors';
import { getActiveNarrow } from '../chat/chatSelectors';
import { NULL_STREAM } from '../nullObjects';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'gray',
    paddingLeft: 4,
    paddingRight: 4,
  },
  text: {
    flex: 4,
    color: 'white',
  },
});

class NotSubscribed extends React.Component {
  props: {
    auth: Auth,
    narrow: Narrow,
    streams: Stream[],
  };

  subscribeToStream = () => {
    const { auth, narrow } = this.props;
    subscriptionAdd(auth, [{ name: narrow[0].operand }]);
  };

  canSubscribeToStream = () => {
    const { narrow, streams } = this.props;
    return !(streams.find(sub => narrow[0].operand === sub.name) || NULL_STREAM).invite_only;
  };

  render() {
    const showSubscribeButton = this.canSubscribeToStream();

    return (
      <View style={styles.container}>
        <Label style={styles.text} text="You are not subscribed to this stream." />
        {showSubscribeButton && <ZulipButton text="Subscribe" onPress={this.subscribeToStream} />}
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    narrow: getActiveNarrow(state),
    streams: state.streams,
  }),
  boundActions,
)(NotSubscribed);
