/* @flow strict-local */
import React, { PureComponent } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { connect } from '../react-redux';
import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import * as NavigationService from './NavigationService';
import type { Dispatch, Account, ThemeName } from '../types';
import { hasAuth as getHasAuth, getAccounts, getHaveServerData, getSettings } from '../selectors';
import AppNavigator from './AppNavigator';

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

  componentWillUnmount() {
    NavigationService.isReadyRef.current = false;
  }

  render() {
    const { theme: themeName, hasAuth, accounts, haveServerData } = this.props;

    const BaseTheme = themeName === 'night' ? DarkTheme : DefaultTheme;

    const theme = {
      ...BaseTheme,
      dark: themeName === 'night',
      colors: {
        ...BaseTheme.colors,
        primary: this.context.color,
        background: this.context.backgroundColor,
        card: this.context.cardColor,
        border: this.context.dividerColor,
      },
    };

    return (
      <NavigationContainer
        ref={NavigationService.navigationContainerRef}
        onReady={() => {
          NavigationService.isReadyRef.current = true;
        }}
        theme={theme}
      >
        <AppNavigator {...{ hasAuth, accounts, haveServerData }} />
      </NavigationContainer>
    );
  }
}

export default connect(state => ({
  theme: getSettings(state).theme,
  hasAuth: getHasAuth(state),
  accounts: getAccounts(state),
  haveServerData: getHaveServerData(state),
}))(ZulipAppContainer);
