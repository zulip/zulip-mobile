/* @flow */
import React, { PureComponent } from 'react';
import TitleSpecial from './TitleSpecial';

export default class TitleHome extends PureComponent {
  render() {
    const { color } = this.props;

    return <TitleSpecial narrow={[{ operand: 'home' }]} color={color} />;
  }
}
