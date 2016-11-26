import React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  message: {
    paddingTop: 0,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 48,
    overflow: 'hidden',
  },
});

export default class MessageBrief extends React.PureComponent {

  props: {
    message: string,
  };

  render() {
    const { message } = this.props;

    return (
      <View style={styles.message}>
        {message}
      </View>
    );
  }
}
