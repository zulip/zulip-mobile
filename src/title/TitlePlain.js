/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

type Props = {
  text: string,
  color: string,
};

export default class TitlePrivate extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { text, color } = this.props;
    return <Text style={[styles.navBar, { color }]}>{text}</Text>;
  }
}
