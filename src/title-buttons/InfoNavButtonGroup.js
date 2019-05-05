/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch, Narrow, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { getRecipientsInGroupNarrow } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type SelectorProps = {|
  recipients: UserOrBot[],
|};

type Props = {|
  color: string,
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|};

class InfoNavButtonGroup extends PureComponent<Props> {
  handlePress = () => {
    const { dispatch, recipients } = this.props;
    dispatch(navigateToGroupDetails(recipients));
  };

  render() {
    const { color } = this.props;

    return <NavButton name="info" color={color} onPress={this.handlePress} />;
  }
}

export default connect((state, props): SelectorProps => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(InfoNavButtonGroup);
