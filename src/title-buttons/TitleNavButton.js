/* @flow */
import React, { PureComponent } from 'react';

import NavButton from '../nav/NavButton';

type Props = {
  color: string,
  name: string,
  onPress: () => void,
};

export default class InfoNavButton extends PureComponent<Props> {
  props: Props;

  render() {
    const { color, name, onPress } = this.props;

    return <NavButton name={name} color={color} onPress={onPress} />;
  }
}
