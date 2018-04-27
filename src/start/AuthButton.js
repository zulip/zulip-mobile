/* @flow */
import React, { Component } from 'react';

import { ZulipButton } from '../common';

type Props = {
  name: string,
  Icon: Object,
  onPress: () => void,
};

export default class AuthButton extends Component<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { styles } = this.context;
    const { name, Icon, onPress } = this.props;

    return (
      <ZulipButton
        style={styles.halfMarginTop}
        secondary
        text={`Log in with ${name}`}
        Icon={Icon}
        onPress={onPress}
      />
    );
  }
}
