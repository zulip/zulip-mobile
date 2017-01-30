import React from 'react';
import { StyleSheet, View } from 'react-native';

import HtmlChildren from './HtmlChildren';

const styles = StyleSheet.create({
  userMention: {
  }
});

export default class HtmlDiv extends React.PureComponent {

  render() {
    const { children } = this.props;

    return (
      <View style={styles.text}>
        {children && <HtmlChildren dom={children} />}
      </View>
    );
  }
}
