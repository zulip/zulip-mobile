/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { ChildrenArray } from '../types';
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
  // This errors because `string` is too generic:
  // string [1] is incompatible with string enum [2].
  // In reality, `theme`  is and should be marked as an enum of type
  // `ThemeType`. However, doing so throws another error:
  // undefined [1] is incompatible with string enum [2].
  // We should figure out what causes this and fix it.
  // $FlowFixMe
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

export default connect(state => ({
  theme: getSettings(state).theme,
}))(StyleProvider);
