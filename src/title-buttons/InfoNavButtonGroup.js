/* @flow */
import React, { PureComponent } from 'react';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { getRecipientsInGroupNarrow } from '../selectors';
import NavButton from '../nav/NavButton';

type Props = {
  actions: Actions,
  color: string,
  recipients: string[],
};

class InfoNavButtonGroup extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { actions, recipients } = this.props;
    actions.navigateToGroupDetails(recipients);
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connectWithActions((state, props) => ({
  recipients: getRecipientsInGroupNarrow(props.narrow)(state),
}))(InfoNavButtonGroup);
