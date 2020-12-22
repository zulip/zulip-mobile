/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Auth, Stream, Dispatch, Narrow } from '../types';
import { connect } from '../react-redux';
import * as api from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth, getStreamInNarrow } from '../selectors';
import styles from '../styles';

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  stream: { ...Stream },
|}>;

type Props = $ReadOnly<{|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class NotSubscribed extends PureComponent<Props> {
  subscribeToStream = () => {
    const { auth, stream } = this.props;
    api.subscriptionAdd(auth, [{ name: stream.name }]);
  };

  render() {
    const { stream } = this.props;

    return (
      <View style={styles.disabledComposeBox}>
        <Label style={styles.disabledComposeText} text="You are not subscribed to this stream" />
        {!stream.invite_only && (
          <ZulipButton
            style={styles.disabledComposeButton}
            text="Subscribe"
            onPress={this.subscribeToStream}
          />
        )}
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  auth: getAuth(state),
  stream: getStreamInNarrow(state, props.narrow),
}))(NotSubscribed);
