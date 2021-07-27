/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { useSelector, useDispatch } from '../react-redux';
import { SwitchRow } from '../common';
import { getSelfUserAwayStatus } from '../selectors';
import { updateUserAwayStatus } from '../user-status/userStatusActions';

type Props = $ReadOnly<{||}>;

/**
 * This is a stand-alone component that:
 *  * retrieves the current user's `user status` data and presents it
 *  * allows by switching it to control the `away` status
 */
export default function AwayStatusSwitch(props: Props): Node {
  const awayStatus = useSelector(getSelfUserAwayStatus);
  const dispatch = useDispatch();

  return (
    <SwitchRow
      label="Set yourself to away"
      value={awayStatus}
      onValueChange={(away: boolean) => {
        dispatch(updateUserAwayStatus(away));
      }}
    />
  );
}
