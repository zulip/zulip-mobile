/* @flow */
import React, { PureComponent, Children } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, LocalizableText, StyleObj, Connector } from '../types';
import boundActions from '../boundActions';
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

type OwnProps = {
  title?: LocalizableText,
  titleColor?: ?string,
  itemsColor?: ?string,
  rightItem?: Object,
  style: StyleObj,
  children?: Children,
  isRightItemNav?: boolean,
  childrenStyle?: StyleObj,
};

type ReduxProps = {
  actions: Actions,
  nav: any,
};

type Props = OwnProps & ReduxProps;

class ModalNavBar extends PureComponent {
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
      React.Children.count(this.props.children) === 0
        ? <Label style={textStyle} text={title} />
        : this.props.children;

    return (
      <View style={[styles.navBar, style]}>
        {nav.index > 0 &&
          !isRightItemNav &&
          <NavButton name="ios-arrow-back" color={itemsColor} onPress={actions.navigateBack} />}
        <View style={[customStyles.centerItem, childrenStyle]}>
          {content}
        </View>
        {rightItem && <NavButton color={itemsColor} {...rightItem} />}
      </View>
    );
  }
}

const connector: Connector<OwnProps, Props> = connect(
  state => ({
    nav: state.nav,
  }),
  boundActions,
);

export default connector(ModalNavBar);
