/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Node as React$Node } from 'react';
import type { GlobalState, ThemeName } from '../types';
import { getSettings } from '../directSelectors';
import { stylesFromTheme, themeColors, ThemeContext } from '../styles/theme';

const Dummy = props => props.children;

type OwnProps = {|
  children: React$Node,
|};

type StateProps = {|
  theme: ThemeName,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

class StyleProvider extends PureComponent<Props> {
  static childContextTypes = {
    styles: () => {},
  };

  static defaultProps = {
    theme: 'default',
  };

  getChildContext() {
    const { theme } = this.props;
    const styles = stylesFromTheme(theme);
    return { styles };
  }

  render() {
    const { children, theme } = this.props;

    return (
      <ThemeContext.Provider value={themeColors[theme]}>
        <Dummy key={theme}>{children}</Dummy>
      </ThemeContext.Provider>
    );
  }
}

export default connect((state: GlobalState) => ({
  theme: getSettings(state).theme,
}))(StyleProvider);
