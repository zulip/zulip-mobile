/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import type { Auth, Stream, Dispatch, UserOrBot, Subscription } from '../types';
import { connect } from '../react-redux';
import * as api from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth } from '../selectors';

type SelectorProps = {|
  auth: Auth,
|};

type Props = $ReadOnly<{|
  user: UserOrBot,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
  onDismiss: (user: UserOrBot) => void,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'hsl(40, 100%, 60%)', // Material warning-color
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'orange',
  },
  text: {
    flex: 1,
    color: 'white',
  },
  button: {
    backgroundColor: 'orange',
    padding: 6,
  },
});

class MentionedUserNotSubscribed extends PureComponent<Props> {
  subscribeToStream = () => {
    const { auth, stream, user } = this.props;
    api.subscriptionAdd(auth, [{ name: stream.name }], [user.email]);
    this.handleDismiss();
  };

  handleDismiss = () => {
    const { user, onDismiss } = this.props;
    onDismiss(user);
  };

  render() {
    const { user } = this.props;

    return (
      <View>
        <TouchableOpacity onPress={this.handleDismiss} style={styles.outer}>
          <Label
            text={{
              text: '{username} will not be notified unless you subscribe them to this stream.',
              values: { username: user.full_name },
            }}
            style={styles.text}
          />
          <ZulipButton style={styles.button} text="Subscribe" onPress={this.subscribeToStream} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
}))(MentionedUserNotSubscribed);
