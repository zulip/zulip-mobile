/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch } from '../types';
import { getRecipientsInGroupNarrow } from '../selectors';
import NavButton from '../nav/NavButton';
import { navigateToGroupDetails } from '../actions';

type OwnProps = {|
  color: string,
|};

type StateProps = {|
  dispatch: Dispatch,
  recipients: string[],
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
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

export default connect((state, props) => ({
  recipients: getRecipientsInGroupNarrow(state, props.narrow),
}))(InfoNavButtonGroup);
