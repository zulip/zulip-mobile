/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Label from './Label';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
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

type Props = $ReadOnly<{|
  text: string,
|}>;

export default class SearchEmptyState extends PureComponent<Props> {
  render(): React$Node {
    const { text } = this.props;

    return (
      <View style={styles.container}>
        <Label style={styles.text} text={text} />
      </View>
    );
  }
}
