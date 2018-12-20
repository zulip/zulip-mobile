/* @flow */
import React, { PureComponent } from 'react';

import type { Context } from '../types';
import { ZulipButton } from '../common';
import styles from '../styles';

type Props = {|
  name: string,
  Icon: Object,
  onPress: () => void,
|};

export default class AuthButton extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
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
