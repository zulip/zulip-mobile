/* @flow */
import { Children, PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import themeCreator from './styles/theme';
import themeDark from './styles/themeDark';
import themeLight from './styles/themeLight';

const themeNameToObject = {
  default: themeLight,
  light: themeLight,
  night: themeDark,
};

export default class StyleProvider extends PureComponent {
  props: {
    theme: string,
    children?: any,
  };

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
    return Children.only(this.props.children);
  }
}
