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
    const d = `M${radius + thickness / 2} ${thickness / 2}
               A${radius} ${radius} 0 0 1 ${radius * 2 + thickness / 2} ${radius + thickness / 2}`;

    return <ART.Shape d={d} strokeCap="butt" stroke={color} strokeWidth={thickness} />;
  }
}
