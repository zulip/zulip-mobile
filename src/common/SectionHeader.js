/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import Label from './Label';

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: 'rgba(127, 127, 127, 0.75)',
  },
});

type Props = {
  text: string,
};

export default class SectionHeader extends PureComponent<Props> {
  props: Props;

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
