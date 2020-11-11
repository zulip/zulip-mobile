/* @flow strict-local */
import React, { PureComponent } from 'react';
import {
  createAppContainer,
  type NavigationState,
  type NavigationContainerProps,
  type NavigationContainer,
} from 'react-navigation';

import { connect } from '../react-redux';
import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import * as NavigationService from './NavigationService';
import getInitialRouteInfo from './getInitialRouteInfo';
import type { Dispatch, Account, ThemeName } from '../types';
import { hasAuth as getHasAuth, getAccounts, getHaveServerData, getSettings } from '../selectors';
import { createAppNavigator } from './AppNavigator';

type SelectorProps = $ReadOnly<{|
  theme: ThemeName,
  hasAuth: boolean,
  accounts: Account[],
  haveServerData: boolean,
|}>;

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * Wrapper for React Nav's component given by `createAppContainer`.
 *
 * Must be constructed after the store has been rehydrated.
 *
 * - Set `NavigationService`.
 *
 * - Call `createAppContainer` with the appropriate `initialRouteName`
 *   and `initialRouteParams` which we get from data in Redux.
 */
class ZulipAppContainer extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  // (odd spacing choices)
  // eslint-disable-next-line
  AppContainer: NavigationContainer<
    NavigationState,
    { ... },
    NavigationContainerProps<{ ... }, NavigationState>,
  >;

  constructor(props: Props) {
    super(props);
    const { hasAuth, accounts, haveServerData } = this.props;
    this.AppContainer = createAppContainer<NavigationState, { ... }>(
      createAppNavigator(getInitialRouteInfo({ hasAuth, accounts, haveServerData })),
    );
  }

  render() {
    const { AppContainer } = this;
    const { theme } = this.props;

    return (
      // The `theme` prop is documented, but apparently not included
      // in the type we're using:
      // https://reactnavigation.org/docs/4.x/themes/
      // $FlowFixMe
      <AppContainer
        ref={NavigationService.appContainerRef}
        theme={theme === 'default' ? 'light' : 'dark'}
      />
    );
  }
}

export default connect(state => ({
  theme: getSettings(state).theme,
  hasAuth: getHasAuth(state),
  accounts: getAccounts(state),
  haveServerData: getHaveServerData(state),
}))(ZulipAppContainer);
