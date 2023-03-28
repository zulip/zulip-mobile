// @flow strict-local
import * as React from 'react';
import { AppState } from 'react-native';

import { useGlobalSelector, useSelector, useDispatch } from '../react-redux';
import { getHasAuth } from '../account/accountsSelectors';
import { reportPresence } from '../actions';
import Heartbeat from './heartbeat';
import { getPresence } from './presenceModel';

type Props = $ReadOnly<{||}>;

/**
 * Component providing a recurrent `presence` signal.
 */
// TODO(#5005): either make one of these per account, or make it act on all accounts
export default function PresenceHeartbeat(props: Props): React.Node {
  const dispatch = useDispatch();
  const hasAuth = useGlobalSelector(getHasAuth); // a job for withHaveServerDataGate?
  const pingIntervalSeconds = useSelector(state => getPresence(state).pingIntervalSeconds);

  React.useEffect(() => {
    if (!hasAuth) {
      return;
    }

    const onHeartbeat = () => {
      // TODO(#5005): should ensure this gets the intended account
      dispatch(reportPresence(true));
    };
    const heartbeat = new Heartbeat(onHeartbeat, pingIntervalSeconds * 1000);

    // React to any state change.
    const updateHeartbeatState = () => {
      // heartbeat.toState is idempotent
      heartbeat.toState(AppState.currentState === 'active');
    };

    const sub = AppState.addEventListener('change', updateHeartbeatState);
    updateHeartbeatState(); // conditional start

    return () => {
      sub.remove();
      heartbeat.stop(); // unconditional stop
    };
  }, [dispatch, hasAuth, pingIntervalSeconds]);

  return null;
}
