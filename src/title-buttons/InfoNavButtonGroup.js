/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch } from '../types';
import { getRecipientsInGroupNarrow } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type Props = {
  dispatch: Dispatch,
  color: string,
  recipients: string[],
};

class InfoNavButtonGroup extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { dispatch, recipients } = this.props;
    dispatch(navigateToGroupDetails(recipients));
  };

  render() {
    const { color } = this.props;

    return (
      <NavButton
        accessibilityLabel="Group recipients"
        name="info"
        color={color}
        onPress={this.handlePress}
      />
    );
  }
}

export default connect((state, props) => ({
  recipients: getRecipientsInGroupNarrow(props.narrow)(state),
}))(InfoNavButtonGroup);
