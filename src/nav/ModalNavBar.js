/* @flow */
import React, { PureComponent, Children } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, LocalizableText, StyleObj } from '../types';
import connectWithActions from '../connectWithActions';
import { CONTROL_SIZE } from '../styles';
import { Label } from '../common';
import NavButton from './NavButton';

const customStyles = StyleSheet.create({
  centerItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'center',
  },
});

type Props = {
  actions: Actions,
  nav: any,
  title?: LocalizableText,
  titleColor?: ?string,
  itemsColor?: ?string,
  rightItem?: Object,
  style: StyleObj,
  children?: Children,
  isRightItemNav?: boolean,
  childrenStyle?: StyleObj,
};

class ModalNavBar extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { styles } = this.context;
    const {
      actions,
      nav,
      title,
      titleColor,
      itemsColor,
      rightItem,
      style,
      isRightItemNav,
      childrenStyle,
    } = this.props;
    const textStyle = [
      styles.navTitle,
      nav.index > 0 && !isRightItemNav && { marginRight: CONTROL_SIZE },
      rightItem ? { marginLeft: CONTROL_SIZE } : {},
      titleColor ? { color: titleColor } : {},
    ];
    const content =
      React.Children.count(this.props.children) === 0 ? (
        <Label style={textStyle} text={title} />
      ) : (
        this.props.children
      );

    return (
      <View style={[styles.navBar, style]}>
        {nav.index > 0 &&
          !isRightItemNav && (
            <NavButton name="ios-arrow-back" color={itemsColor} onPress={actions.navigateBack} />
          )}
        <View style={[customStyles.centerItem, childrenStyle]}>{content}</View>
        {rightItem && <NavButton color={itemsColor} {...rightItem} />}
      </View>
    );
  }
}

export default connectWithActions(state => ({
  nav: state.nav,
}))(ModalNavBar);
