/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import { useSelector, useDispatch } from '../react-redux';
import { getSession } from '../directSelectors';
import { registerAndStartPolling } from '../events/eventActions';
import { sendOutbox } from '../outbox/outboxActions';
import { initNotifications } from '../notification/notifTokens';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function AppDataFetcher(props: Props): Node {
  const needsInitialFetch = useSelector(state => getSession(state).needsInitialFetch);
  const dispatch = useDispatch();

  const init = useCallback(async () => {
    if (needsInitialFetch) {
      await dispatch(registerAndStartPolling());

      // TODO(#3881): Lots of issues with outbox sending
      dispatch(sendOutbox());

      dispatch(initNotifications());
    }
  }, [needsInitialFetch, dispatch]);

  React.useEffect(() => {
    init();
  }, [init]);

  return props.children;
}
