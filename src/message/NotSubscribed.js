/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Auth, Narrow, Stream } from '../types';
import { subscriptionAdd } from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth, getStreamInNarrow } from '../selectors';
import styles from '../styles';

type OwnProps = {|
  narrow: Narrow,
|};

type StateProps = {|
  auth: Auth,
  stream: { ...Stream },
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

class NotSubscribed extends PureComponent<Props> {
  subscribeToStream = () => {
    const { auth, stream } = this.props;
    subscriptionAdd(auth, [{ name: stream.name }]);
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

export default connect((state, props) => ({
  auth: getAuth(state),
  stream: getStreamInNarrow(props.narrow)(state),
}))(NotSubscribed);
