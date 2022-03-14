/* @flow strict-local */

import { useCallback, useEffect } from 'react';
import type { Node } from 'react';

import { useGlobalSelector, useDispatch } from '../react-redux';
import { getHasAuth } from '../selectors';
import { registerAndStartPolling } from '../events/eventActions';
import { sendOutbox } from '../outbox/outboxActions';
import { initNotifications } from '../notification/notifTokens';

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function AppDataFetcher(props: Props): Node {
  const dispatch = useDispatch();

  const hasAuth = useGlobalSelector(getHasAuth);

  const init = useCallback(async () => {
    // Init right away if there's an active, logged-in account.
    // NB `getInitialRouteInfo` depends intimately on this behavior.
    if (hasAuth) {
      await dispatch(registerAndStartPolling());

      // TODO(#3881): Lots of issues with outbox sending
      dispatch(sendOutbox());

      dispatch(initNotifications());
    }
  }, [hasAuth, dispatch]);

  useEffect(
    () => {
      init();
    },

    // This effect does its work only if `hasAuth` is true at first startup
    // (after rehydrate; this component is under HideIfNotHydrated, so it
    // only exists then) -- not if `hasAuth` later becomes true.
    //
    // This breaks the normal rules of Hooks.  We make it OK because if
    // `hasAuth` later becomes true, that can only be via ACCOUNT_SWITCH or
    // LOGIN_SUCCESS; and when we dispatch one of those, we make sure to
    // also dispatch much the same set of actions as this effect would.
    //
    // The reason we do it this way is that at account switch or login, we
    // want to do these things even if `hasAuth` was already true with a
    // previously active account.  It's also just more readable to have them
    // be invoked directly from the code for switching account or logging
    // in, rather than indirectly at a distance as this effect would be.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return props.children;
}
