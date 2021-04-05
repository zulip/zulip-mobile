/* @flow strict-local */
import React, { type ComponentType } from 'react';
import { compose } from 'redux';

import { connect, useSelector } from './react-redux';
import { getHaveServerData } from './selectors';
import FullScreenLoading from './common/FullScreenLoading';

export default function withHaveServerDataGate<P, C: ComponentType<P>>(Comp: C): ComponentType<P> {
  return compose(
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
    (connect<{||}, _, _>(): (ComponentType<P>) => ComponentType<P>),
    CompInner => (props: P) =>
      useSelector(getHaveServerData) ? (
        <CompInner {...props} />
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
  )(Comp);
}
