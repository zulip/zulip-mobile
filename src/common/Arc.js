/* @flow */
import React from 'react';
import { ART } from 'react-native';

type Props = {
  color: string,
  size: number,
  thickness: number,
};

export default class Arc extends React.PureComponent<Props> {
  props: Props;

  render() {
    const { color, size, thickness } = this.props;

    const radius = (size - thickness) / 2;
    const circle = ART.Path()
      .move(size / 2, thickness / 2)
      .arc(0, radius, radius);

    return <ART.Shape d={circle} stroke={color} strokeWidth={thickness} />;
  }
}
