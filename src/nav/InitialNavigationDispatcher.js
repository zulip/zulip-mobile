/* @flow strict-local */
import type { Node as React$Node } from 'react';
import { PureComponent } from 'react';

import type { Dispatch, Account } from '../types';
import { resetToAccountPicker, resetToRealmScreen, resetToMainTabs } from '../actions';
import { connect } from '../react-redux';
import { getIsHydrated, hasAuth as getHasAuth, getHaveServerData } from '../selectors';

type SelectorProps = $ReadOnly<{|
  isHydrated: boolean,
  hasAuth: boolean,
  accounts: Account[],
  haveServerData: boolean,
|}>;

type Props = $ReadOnly<{|
  children: React$Node,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class InitialNavigationDispatcher extends PureComponent<Props> {
  componentDidMount() {
    if (this.props.isHydrated) {
      this.doInitialNavigation();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isHydrated && this.props.isHydrated) {
      this.doInitialNavigation();
    }
  }

  /**
   * Data has been loaded, so open the app to the right screen.
   *
   * Not to be called before the REHYDRATE action, and not to be
   * called more than once.
   */
  doInitialNavigation = () => {
    const { hasAuth, accounts, haveServerData, dispatch } = this.props;

    // If the active account is not logged in, show account screen.
    if (!hasAuth) {
      if (accounts.length > 1) {
        dispatch(resetToAccountPicker());
        return;
      } else {
        dispatch(resetToRealmScreen({ initial: true }));
        return;
      }
    }

    // If there's an active, logged-in account but no server data, then behave
    // like `ACCOUNT_SWITCH`: show loading screen.  Crucially, `sessionReducer`
    // will have set `needsInitialFetch`, too, so we really will be loading.
    if (!haveServerData) {
      // We're already on the loading screen -- see `initialRouteName`
      // in `AppNavigator`.
      return;
    }

    // Great: we have an active, logged-in account, and server data for it.
    // Show the main UI.
    dispatch(resetToMainTabs());
  };

  render() {
    return this.props.children;
  }
}

export default connect(state => ({
  hasAuth: getHasAuth(state),
  accounts: state.accounts,
  haveServerData: getHaveServerData(state),
  isHydrated: getIsHydrated(state),
}))(InitialNavigationDispatcher);
