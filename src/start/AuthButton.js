/* @flow */
import React, { PureComponent } from 'react';

import { ZulipButton } from '../common';
import styles from '../styles';

type Props = {|
  name: string,
  Icon: Object,
  onPress: () => void,
|};

export default class AuthButton extends PureComponent<Props> {
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
