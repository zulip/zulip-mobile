/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View, TouchableOpacity, LayoutAnimation } from 'react-native';

import type { Auth, Stream, Dispatch, UserOrBot, Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import * as api from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth } from '../selectors';

type SelectorProps = {|
  auth: Auth,
|};

type Props = $ReadOnly<{|
  height: number,
  user: UserOrBot,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
  onDismiss: (user: UserOrBot) => void,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

const styles = createStyleSheet({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'hsl(40, 100%, 60%)', // Material warning-color
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  text: {
    flex: 1,
    color: 'black',
  },

  button: {
    backgroundColor: 'orange',

    // Based on MarkUnreadButton.
    // TODO make these less ad hoc.
    borderWidth: 0,
    borderRadius: 16,
    height: 32,
    paddingLeft: 12,
    paddingRight: 12,
  },
  buttonText: {
    color: 'black',
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
  componentDidMount() {
    LayoutAnimation.configureNext({ ...LayoutAnimation.Presets.easeInEaseOut, duration: 100 });
  }
  componentWillUnmount() {
    LayoutAnimation.configureNext({ ...LayoutAnimation.Presets.easeInEaseOut, duration: 100 });
  }
  render() {
    const { user, height } = this.props;
    const hitSlop = {
      top: 6,
      right: 0,
      bottom: 6,
      left: 0,
    };

    return (
      <View style={[styles.wrapper, { bottom: height }]}>
        <TouchableOpacity onPress={this.handleDismiss} style={styles.outer}>
          <Label
            text={{
              text: '{username} will not be notified unless you subscribe them to this stream.',
              values: { username: user.full_name },
            }}
            style={styles.text}
          />
          <ZulipButton
            style={styles.button}
            textStyle={styles.buttonText}
            text="Subscribe"
            onPress={this.subscribeToStream}
            hitSlop={hitSlop}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
}))(MentionedUserNotSubscribed);
