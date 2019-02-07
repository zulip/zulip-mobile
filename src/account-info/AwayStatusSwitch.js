/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState, User, UserStatusMapObject } from '../types';
import { OptionRow } from '../common';
import { getSelfUserDetail, getUserStatus } from '../selectors';
import { updateUserAwayStatus } from '../user-status/userStatusActions';

type PropsFromState = {|
  selfUserDetail: User,
  userStatus: UserStatusMapObject,
|};

type Props = {|
  ...PropsFromState,
  dispatch: Dispatch,
|};

class AwayStatusSwitch extends PureComponent<Props> {
  handleUpdateAwayStatus = (away: boolean) => {
    const { dispatch } = this.props;
    dispatch(updateUserAwayStatus(away));
  };

  render() {
    const { selfUserDetail, userStatus } = this.props;
    const selfUserStatus = userStatus[selfUserDetail.user_id];
    const away = !!(selfUserStatus && selfUserStatus.away);

    return (
      <OptionRow
        label="Set yourself to away"
        defaultValue={away}
        onValueChange={this.handleUpdateAwayStatus}
      />
    );
  }
}

export default connect((state: GlobalState) => ({
  selfUserDetail: getSelfUserDetail(state),
  userStatus: getUserStatus(state),
}))(AwayStatusSwitch);
