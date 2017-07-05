/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { subscriptionAdd } from '../api';
import { ZulipButton, Label } from '../common';
import { getAuth } from '../account/accountSelectors';
import { Auth, Narrow } from '../types';

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

type Props = {
  auth: Auth,
  narrow: Narrow,
  showSubscribeButton: boolean,
};

class NotSubscribed extends React.Component {

  props: Props;

  subscribeToStream = () => {
    const { auth, narrow } = this.props;
    subscriptionAdd(auth, [{ name: narrow[0].operand }]);
  };

  render() {
    const { showSubscribeButton } = this.props;

    return (
      <View style={styles.container}>
        <Label
          style={styles.text}
          text="You are not subscribed to this stream."
        />
        {showSubscribeButton &&
        <ZulipButton
          text="Subscribe"
          onPress={this.subscribeToStream}
        />}
      </View>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
}), boundActions)(NotSubscribed);
