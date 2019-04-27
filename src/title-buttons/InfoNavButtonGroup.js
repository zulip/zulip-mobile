/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { InjectedDispatch, Narrow, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { getRecipientsInGroupNarrow } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type OwnProps = {|
  color: string,
  narrow: Narrow,
|};

type SelectorProps = {|
  recipients: UserOrBot[],
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
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
