/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text } from 'react-native';
import { CONTROL_SIZE } from '../styles';

const styles = StyleSheet.create({
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    paddingRight: CONTROL_SIZE,
  },
});

type Props = {
  text: string,
  color: string,
};

export default class TitlePrivate extends PureComponent<Props> {
  render() {
    const { text, color } = this.props;
    return <Text style={[styles.title, { color }]}>{text}</Text>;
  }
}
