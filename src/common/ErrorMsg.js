/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Label from './Label';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  field: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

type Props = $ReadOnly<{|
  error: string,
|}>;

/**
 * Displays a styled error message.
 * If no message provided, component is not rendered.
 *
 * @prop error - The error message string.
 */
export default class ErrorMsg extends PureComponent<Props> {
  render() {
    const { error } = this.props;

    if (!error) {
      return null;
    }

    return (
      <View style={styles.field}>
        <Label style={styles.error} text={error} />
      </View>
    );
  }
}
