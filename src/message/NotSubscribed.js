/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Auth, Narrow, Stream } from '../types';
import connectWithActions from '../connectWithActions';
import { subscriptionAdd } from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth, getActiveNarrow } from '../selectors';
import { NULL_STREAM } from '../nullObjects';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'gray',
    paddingLeft: 16,
    paddingTop: 8,
    paddingRight: 16,
    paddingBottom: 8,
  },
  text: {
    flex: 4,
    color: 'white',
  },
});

type Props = {
  auth: Auth,
  narrow: Narrow,
  streams: Stream[],
};

class NotSubscribed extends PureComponent<Props> {
  props: Props;

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
        <Label style={styles.text} text="You are not subscribed to this stream" />
        {showSubscribeButton && <ZulipButton text="Subscribe" onPress={this.subscribeToStream} />}
      </View>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  narrow: getActiveNarrow(state),
  streams: state.streams,
}))(NotSubscribed);
