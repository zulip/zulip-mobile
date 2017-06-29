/* @flow */
import React, { Children } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { CONTROL_SIZE } from '../styles';
import { Label } from '../common';
import NavButton from './NavButton';
import { LocalizableText, PopRouteAction, StyleObj } from '../types';

const customStyles = StyleSheet.create({
  centerItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'center',
  },
});

class ModalNavBar extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    nav: any,
    title?: LocalizableText,
    titleColor?: ?string,
    itemsColor?: ?string,
    rightItem?: Object,
    style: StyleObj,
    children?: Children,
    popRoute: PopRouteAction,
    isRightItemNav?: boolean,
    childrenStyle?: StyleObj,
  };

  render() {
    const { styles } = this.context;
    const {
      nav,
      title,
      titleColor,
      itemsColor,
      popRoute,
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
    const content = React.Children.count(this.props.children) === 0
      ? <Label style={textStyle} text={title} />
      : this.props.children;

    return (
      <View style={[styles.navBar, style]}>
        {nav.index > 0 && !isRightItemNav &&
          <NavButton name="ios-arrow-back" color={itemsColor} onPress={popRoute} />
        }
        <View style={[customStyles.centerItem, childrenStyle]}>
          {content}
        </View>
        {rightItem && <NavButton color={itemsColor} {...rightItem} />}
      </View>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
  }),
  boundActions,
)(ModalNavBar);
