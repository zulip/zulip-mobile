/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ChildrenArray } from 'react';

import type { Actions, LocalizableText, StyleObj } from '../types';
import connectWithActions from '../connectWithActions';
import { NAVBAR_SIZE } from '../styles';
import { Label } from '../common';
import { getCanGoBack } from '../selectors';
import NavButton from './NavButton';

type Props = {
  actions: Actions,
  canGoBack: boolean,
  title?: LocalizableText,
  titleColor?: string,
  itemsColor: string,
  rightItem?: Object,
  style: StyleObj,
  children?: ChildrenArray<*>,
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
      canGoBack,
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
      canGoBack && !isRightItemNav && { marginRight: NAVBAR_SIZE },
      rightItem ? { marginLeft: NAVBAR_SIZE } : {},
      titleColor ? { color: titleColor } : {},
    ];
    const content =
      React.Children.count(this.props.children) === 0 ? (
        <Label style={textStyle} text={title} numberOfLines={1} ellipsizeMode="tail" />
      ) : (
        this.props.children
      );

    return (
      <View style={[styles.navBar, style]}>
        {canGoBack &&
          !isRightItemNav && (
            <NavButton name="arrow-left" color={itemsColor} onPress={actions.navigateBack} />
          )}
        <View style={[styles.flexed, childrenStyle]}>{content}</View>
        {rightItem && <NavButton color={itemsColor} {...rightItem} />}
      </View>
    );
  }
}

export default connectWithActions(state => ({
  canGoBack: getCanGoBack(state),
}))(ModalNavBar);
