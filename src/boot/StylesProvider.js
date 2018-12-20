/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { ChildrenArray, GlobalState, ThemeName } from '../types';
import { getSettings } from '../directSelectors';
import { stylesFromTheme } from '../styles/theme';

const Dummy = props => props.children;

type Props = {|
  theme: ThemeName,
  children: ChildrenArray<*>,
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

    return <Dummy key={theme}>{children}</Dummy>;
  }
}

export default connect((state: GlobalState) => ({
  theme: getSettings(state).theme,
}))(StyleProvider);
