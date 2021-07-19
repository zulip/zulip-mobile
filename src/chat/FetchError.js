/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import { Label } from '../common';
import { TimeoutError } from '../utils/async';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    paddingLeft: 10,
    padding: 8,
  },
});

type Props = $ReadOnly<{|
  narrow: Narrow,
  error: Error,
|}>;

export default class FetchError extends PureComponent<Props> {
  render(): React$Node {
    return (
      <View style={styles.container}>
        {(() => {
          if (this.props.error instanceof TimeoutError) {
            return <Label style={styles.text} text="Request timed out." />;
          } else {
            return <Label style={styles.text} text="Oops! Something went wrong." />;
          }
        })()}
      </View>
    );
  }
}
