/* @flow */
import React, { PureComponent } from 'react';

import type { Context } from '../types';
import { ZulipButton } from '../common';

type Props = {
  name: string,
  Icon: Object,
  onPress: () => void,
};

export default class AuthButton extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

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
