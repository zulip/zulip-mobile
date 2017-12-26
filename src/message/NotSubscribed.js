/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Auth, Stream } from '../types';
import connectWithActions from '../connectWithActions';
import { subscriptionAdd } from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth, getStreamInNarrow } from '../selectors';

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
    flex: 1,
    color: 'white',
  },
  button: {
    padding: 10,
  },
});

type Props = {
  auth: Auth,
  stream: Stream,
};

class NotSubscribed extends PureComponent<Props> {
  props: Props;

  subscribeToStream = () => {
    const { auth, stream } = this.props;
    subscriptionAdd(auth, [{ name: stream.name }]);
  };

  render() {
    const { stream } = this.props;

    return (
      <View style={styles.container}>
        <Label style={styles.text} text="You are not subscribed to this stream" />
        {!stream.invite_only && (
          <ZulipButton style={styles.button} text="Subscribe" onPress={this.subscribeToStream} />
        )}
      </View>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  stream: getStreamInNarrow(state),
}))(NotSubscribed);
