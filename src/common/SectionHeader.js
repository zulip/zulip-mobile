/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ThemeColors } from '../styles';
import { ThemeContext } from '../styles';
import Label from './Label';

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: 'hsla(0, 0%, 50%, 0.75)',
  },
});

type Props = $ReadOnly<{|
  text: string,
|}>;

export default class SectionHeader extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

  render() {
    const { text } = this.props;
    return (
      <View style={[styles.header, { backgroundColor: this.context.backgroundColor }]}>
        <Label text={text} />
      </View>
    );
  }
}
