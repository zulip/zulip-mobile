/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { useSelector } from '../react-redux';
import { SwitchRow } from '../common';
import { getAuth, getUserStatus, getOwnUserId } from '../selectors';
import * as api from '../api';

type Props = $ReadOnly<{||}>;

/**
 * This is a stand-alone component that:
 *  * retrieves the current user's `user status` data and presents it
 *  * allows by switching it to control the `away` status
 */
export default function AwayStatusSwitch(props: Props): Node {
  const auth = useSelector(getAuth);
  const ownUserId = useSelector(getOwnUserId);
  const awayStatus = useSelector(state => getUserStatus(state, ownUserId).away);

  return (
    <SwitchRow
      label="Set yourself to away"
      value={awayStatus}
      onValueChange={(away: boolean) => {
        api.updateUserStatus(auth, { away });
      }}
    />
  );
}
