/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

type Props = {
  width?: number,
  height?: number,
};

/**
 * An empty layout component used to simplify UI alignment.
 * Use when it is easier to use this instead of setting component
 * padding and margin.
 *
 * @prop [width] - Width of the component in pixels.
 * @prop [height] - Height of the component in pixels.
 */
export default class ViewPlaceholder extends PureComponent<Props> {
  props: Props;

  render() {
    const { width, height } = this.props;
    const style = { width, height };
    return <View style={style} />;
  }
}
