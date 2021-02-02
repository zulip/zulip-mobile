/* @flow strict-local */
import React from 'react';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { OptionRow } from '../common';
import { getSelfUserAwayStatus } from '../selectors';
import { updateUserAwayStatus } from '../user-status/userStatusActions';

type Props = $ReadOnly<{|
  awayStatus: boolean,
  dispatch: Dispatch,
|}>;

/**
 * This is a stand-alone component that:
 *  * retrieves the current user's `user status` data and presents it
 *  * allows by switching it to control the `away` status
 */
function AwayStatusSwitch(props: Props) {
  const { awayStatus } = props;

  return (
    <OptionRow
      label="Set yourself to away"
      value={awayStatus}
      onValueChange={(away: boolean) => {
        const { dispatch } = props;
        dispatch(updateUserAwayStatus(away));
      }}
    />
  );
}

export default connect(state => ({
  awayStatus: getSelfUserAwayStatus(state),
}))(AwayStatusSwitch);
