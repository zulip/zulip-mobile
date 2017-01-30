import React from 'react';
import { StyleSheet, View } from 'react-native';

import HtmlChildren from './HtmlChildren';

const styles = StyleSheet.create({
  div: {
  }
});

export default class HtmlDiv extends React.PureComponent {

  render() {
    const { name, childrenNodes } = this.props;

    return (
      <View style={styles.div}>
        <HtmlChildren childrenNodes={childrenNodes} />
      </View>
    );
  }
}
