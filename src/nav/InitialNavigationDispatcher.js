/* @flow strict-local */
import type { Node as React$Node } from 'react';
import { PureComponent } from 'react';

import NavigationService from './NavigationService';
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
      // `NavigationService` will be ready by the time this is run: a
      // `ref` is set in the `ref`fed component's
      // `componentDidMount` [1], and a parent's `componentDidMount`
      // is run after a child's `componentDidMount` [2].
      //
      // [1] https://reactjs.org/docs/refs-and-the-dom.html#adding-a-ref-to-a-dom-element
      // [2] https://reactnavigation.org/docs/navigating-without-navigation-prop/#handling-initialization
      this.doInitialNavigation();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isHydrated && this.props.isHydrated) {
      // `NavigationService` will be ready here (as long as the
      // `ref`fed component hasn't unmounted for some reason).
      // `componentDidUpdate` won't run before `componentDidMount`,
      // and we've established that it's ready by `componentDidMount`
      // (see note there).
      this.doInitialNavigation();
    }
  }

  /**
   * Data has been loaded, so open the app to the right screen.
   *
   * Not to be called before the REHYDRATE action or before
   * `NavigationService` is ready, and not to be called more than
   * once.
   */
  doInitialNavigation = () => {
    const { hasAuth, accounts, haveServerData } = this.props;

    // If the active account is not logged in, bring the user as close
    // as we can to AuthScreen, the place where they can log in.
    if (!hasAuth) {
      if (accounts.length > 1) {
        // We can't guess which account, of multiple, the user wants
        // to use. Let them pick one.
        NavigationService.dispatch(resetToAccountPicker());
        return;
      } else if (accounts.length === 1) {
        // We already know the realm, so give that to the realm
        // screen. If that screen finds that the realm is valid, it'll
        // send the user along to AuthScreen for that realm right
        // away. If this means you're on the AuthScreen when you don't
        // want to be (i.e., you want to choose a different realm),
        // you can always go back to RealmScreen.
        NavigationService.dispatch(resetToRealmScreen({ initial: true, realm: accounts[0].realm }));
        return;
      } else {
        // Just go to the realm screen and have the user type out the
        // realm.
        NavigationService.dispatch(resetToRealmScreen({ initial: true }));
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
    NavigationService.dispatch(resetToMainTabs());
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
