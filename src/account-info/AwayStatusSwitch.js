/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState } from '../types';
import { OptionRow } from '../common';
import { getSelfUserAwayStatus } from '../selectors';
import { updateUserAwayStatus } from '../user-status/userStatusActions';

type Props = {|
  awayStatus: boolean,
  dispatch: Dispatch,
|};

/**
 * This is a stand-alone component that:
 *  * retrieves the current user's `user status` data and presents it
 *  * allows by switching it to control the `away` status
 */
class AwayStatusSwitch extends PureComponent<Props> {
  handleUpdateAwayStatus = (away: boolean) => {
    const { dispatch } = this.props;
    dispatch(updateUserAwayStatus(away));
  };

  render() {
    const { awayStatus } = this.props;

    return (
      <OptionRow
        label="Set yourself to away"
        defaultValue={awayStatus}
        onValueChange={this.handleUpdateAwayStatus}
      />
    );
  }
}

export default connect((state: GlobalState) => ({
  awayStatus: getSelfUserAwayStatus(state),
}))(AwayStatusSwitch);
