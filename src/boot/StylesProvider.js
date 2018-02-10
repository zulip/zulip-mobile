/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { ChildrenArray } from '../types';
import connectWithActions from '../connectWithActions';
import { getSettings } from '../directSelectors';
import themeCreator from '../styles/theme';
import themeDark from '../styles/themeDark';
import themeLight from '../styles/themeLight';

const themeNameToObject = {
  default: themeLight,
  light: themeLight,
  night: themeDark,
};

const Dummy = props => props.children;

type Props = {
  theme: string,
  children?: ChildrenArray<*>,
};

class StyleProvider extends PureComponent<Props> {
  props: Props;

  static childContextTypes = {
    theme: () => {},
    styles: () => {},
  };

  static defaultProps = {
    theme: 'default',
  };

  getChildContext() {
    const { theme } = this.props;
    const styles = StyleSheet.create(themeCreator(themeNameToObject[theme]));
    return { theme, styles };
  }

  render() {
    const { children, theme } = this.props;

    return <Dummy key={theme}>{children}</Dummy>;
  }
}

export default connectWithActions(state => ({
  theme: getSettings(state).theme,
}))(StyleProvider);
