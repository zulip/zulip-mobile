/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import Label from './Label';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});

type Props = {|
  text: string,
|};

export default class SearchEmptyState extends PureComponent<Props> {
  render() {
    const { text } = this.props;

    return (
      <View style={styles.container}>
        <Label style={styles.text} text={text} />
      </View>
    );
  }
}
