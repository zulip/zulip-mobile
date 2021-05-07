/* @flow strict-local */
import React, { type ComponentType, type ElementConfig, useRef } from 'react';

import { connect } from './react-redux';
import type { Dispatch } from './types';
import { getHaveServerData } from './selectors';
import FullScreenLoading from './common/FullScreenLoading';

/**
 * A HOC for any server-data-dependent screen component that might be
 *   mounted when we don't have server data.
 *
 * Prevents rerendering of the component's subtree unless we have
 * server data.
 *
 * The implementation uses props named `dispatch` and `haveServerData`; the
 * inner component shouldn't try to accept props with those names, and the
 * caller shouldn't try to pass them in.
 *
 * Inside a render method, don't call this directly: like most HOCs, it will
 * return a new value each time.  Instead, use `useHaveServerDataGate`.
 */
// It sure seems like Flow should catch the `dispatch` / `haveServerData`
// thing and reflect it in the types; it's not clear why it doesn't.
export default function withHaveServerDataGate<P: { ... }, C: ComponentType<$Exact<P>>>(
  Comp: C,
): ComponentType<$Exact<ElementConfig<C>>> {
  // `connect` does something useful for us that `useSelector` doesn't
  // do: it interposes a new `ReactReduxContext.Provider` component,
  // which proxies subscriptions so that the descendant components only
  // rerender if this one continues to say their subtree should be kept
  // around. See
  //   https://github.com/zulip/zulip-mobile/pull/4454#discussion_r578140524
  // and some discussion around
  //   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/converting.20to.20Hooks/near/1111970
  // where we describe some limits of our understanding.
  //
  // We found these things out while investigating an annoying crash: we
  // found that `mapStateToProps` on a descendant of `MainTabsScreen`
  // was running -- and throwing an uncaught error -- on logout, and
  // `MainTabsScreen`'s early return on `!haveServerData` wasn't
  // preventing that from happening.
  return connect(state => ({ haveServerData: getHaveServerData(state) }))(
    ({
      dispatch,
      haveServerData,
      ...props
    }: {|
      dispatch: Dispatch,
      haveServerData: boolean,
      ...$Exact<P>,
    |}) =>
      haveServerData ? (
        <Comp {...props} />
      ) : (
        // Show a full-screen loading indicator while waiting for the
        // initial fetch to complete, if we don't have potentially stale
        // data to show instead. Also show it for the duration of the nav
        // transition just after the user logs out (see our #4275).
        //
        // And avoid rendering any of our main UI, to maintain the
        // guarantee that it can all rely on server data existing.
        <FullScreenLoading />
      ),
  );
}

/**
 * Like `withHaveServerDataGate`, but with a stable value on React re-render.
 *
 * This is a React hook.  On initial render, it returns the same value as
 * `withHaveServerDataGate` would.  On re-render, it returns the same value
 * as on the previous render.
 */
export function useHaveServerDataGate<P: { ... }, C: ComponentType<$Exact<P>>>(
  Comp: C,
): ComponentType<$Exact<ElementConfig<C>>> {
  // Not `useMemo`, because that function's memoization is only a
  // performance optimization and not a semantic guarantee.
  return useRef(withHaveServerDataGate(Comp)).current;
}
