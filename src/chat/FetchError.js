/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import ZulipTextIntl from '../common/ZulipTextIntl';
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
  error: mixed,
|}>;

export default class FetchError extends PureComponent<Props> {
  render(): Node {
    return (
      <View style={styles.container}>
        {(() => {
          if (this.props.error instanceof TimeoutError) {
            return <ZulipTextIntl style={styles.text} text="Request timed out." />;
          } else {
            return <ZulipTextIntl style={styles.text} text="Oops! Something went wrong." />;
          }
        })()}
      </View>
    );
  }
}
