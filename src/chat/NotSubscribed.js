import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import ZulipButton from '../common/ZulipButton';

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
  button: {
    flex: 2,
    height: 28,
    paddingLeft: 8,
    paddingRight: 8,
  }
});

export default class NotSubscribed extends React.Component {
  render() {
    const { subscribeStream, showSubscribeButton } = this.props;

    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {"You aren't subscribed to this stream."}
        </Text>
        {showSubscribeButton &&
        <ZulipButton
          customStyles={styles.button}
          text="Subscribe"
          onPress={subscribeStream}
        />}
      </View>
    );
  }
}
