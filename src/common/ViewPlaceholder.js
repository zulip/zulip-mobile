/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

type Props = {
  width?: number,
  height?: number,
};

export default class ViewPlaceholder extends PureComponent<Props> {
  props: Props;

  render() {
    const { width, height } = this.props;
    const style = { width, height };
    return <View style={style} />;
  }
}
