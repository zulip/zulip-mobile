/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Narrow } from '../types';
import connectWithActions from '../connectWithActions';
import NavButton from '../nav/NavButton';

type Props = {
  actions: Actions,
  narrow: Narrow,
  color: string,
};

class InfoNavButtonPrivate extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { actions, narrow } = this.props;
    actions.navigateToAccountDetails(narrow[0].operand);
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connectWithActions(null)(InfoNavButtonPrivate);
