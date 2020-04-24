/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Node as React$Node } from 'react';
import type { ThemeName, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSettings } from '../directSelectors';
import { themeData, ThemeContext } from '../styles/theme';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  theme: ThemeName,
  children: React$Node,
|}>;

class ThemeProvider extends PureComponent<Props> {
  static defaultProps = {
    theme: 'default',
  };

  render() {
    const { children, theme } = this.props;
    return <ThemeContext.Provider value={themeData[theme]}>{children}</ThemeContext.Provider>;
  }
}

export default connect(state => ({
  theme: getSettings(state).theme,
}))(ThemeProvider);
