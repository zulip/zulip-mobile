/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ChildrenArray } from 'react';

import type { Actions, Context, LocalizableText, Style } from '../types';
import { connectWithActionsPreserveOnBack } from '../connectWithActions';
import { NAVBAR_SIZE, SPACING } from '../styles';
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
  style: Style,
  children?: ChildrenArray<*>,
  childrenStyle?: Style,
};

class ModalNavBar extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

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
      childrenStyle,
    } = this.props;
    const textStyle = [
      styles.navTitle,
      canGoBack ? { marginRight: NAVBAR_SIZE } : { marginLeft: SPACING },
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
        {canGoBack && (
          <NavButton name="arrow-left" color={itemsColor} onPress={actions.navigateBack} />
        )}
        <View style={[styles.flexedLeftAlign, childrenStyle]}>{content}</View>
        {rightItem && <NavButton color={itemsColor} {...rightItem} />}
      </View>
    );
  }
}

export default connectWithActionsPreserveOnBack(state => ({
  canGoBack: getCanGoBack(state),
}))(ModalNavBar);
