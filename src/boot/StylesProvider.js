/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

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
  children?: any,
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
  theme: state.settings.theme,
}))(StyleProvider);
