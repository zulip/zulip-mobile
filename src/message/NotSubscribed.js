/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Account, Context, Stream } from '../types';
import { subscriptionAdd } from '../api';
import { ZulipButton, Label } from '../common';
import { getActiveAccount, getStreamInNarrow } from '../selectors';

type Props = {
  auth: Account,
  stream: Stream,
};

class NotSubscribed extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  subscribeToStream = () => {
    const { auth, stream } = this.props;
    subscriptionAdd(auth, [{ name: stream.name }]);
  };

  render() {
    const { styles } = this.context;
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
  auth: getActiveAccount(state),
  stream: getStreamInNarrow(props.narrow)(state),
}))(NotSubscribed);
