import React from 'react';
import { View, StyleSheet } from 'react-native';

import HtmlChildren from './HtmlChildren';

const styles = StyleSheet.create({
  p: {
    marginTop: 8,
    marginBottom: 8,
  }
});

export default class HtmlP extends React.PureComponent {
  render() {
    const { dom } = this.props;

    return (
      <View style={styles.p}>
        <HtmlChildren dom={dom} />
      </View>
    );
  }
}
