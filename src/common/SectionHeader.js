/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context } from '../types';
import Label from './Label';

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: 'hsla(0, 0%, 50%, 0.75)',
  },
});

type Props = {|
  text: string,
|};

export default class SectionHeader extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { text } = this.props;
    return (
      <View style={[styles.header, this.context.styles.backgroundColor]}>
        <Label text={text} />
      </View>
    );
  }
}
