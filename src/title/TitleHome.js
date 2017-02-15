import React from 'react';
import TitleSpecial from './TitleSpecial';

export default class TitleHome extends React.PureComponent {

  render() {
    const { textColor, backgroundColor } = this.props;

    return (
      <TitleSpecial
        narrow={[{ operand: 'home' }]}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />
    );
  }
}
