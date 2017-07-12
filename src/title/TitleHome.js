/* @flow */
import React from 'react';
import TitleSpecial from './TitleSpecial';

export default class TitleHome extends React.PureComponent {
  render() {
    const { color } = this.props;

    return <TitleSpecial narrow={[{ operand: 'home' }]} color={color} />;
  }
}
