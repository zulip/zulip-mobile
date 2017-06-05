import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles, { CONTROL_SIZE } from '../styles';
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

class ModalNavBar extends React.Component {
  props: {
    nav: any,
    title: string,
    navigateBack: () => void,
  };

  render() {
    const { nav, title, titleColor, itemsColor, navigateBack, rightItem, style } = this.props;
    const textStyle = [
      styles.navTitle,
      nav.index > 0 && { marginRight: CONTROL_SIZE },
      rightItem && { marginLeft: CONTROL_SIZE },
      titleColor && { color: titleColor },
    ];
    const content = React.Children.count(this.props.children) === 0
      ? <Label style={textStyle} text={title} />
      : this.props.children;

    return (
      <View style={[styles.navBar, style]}>
        {nav.index > 0 && <NavButton name="ios-arrow-back" color={itemsColor} onPress={navigateBack} />}
        <View style={customStyles.centerItem}>
          {content}
        </View>
        {rightItem &&
          <NavButton name={rightItem.name} color={itemsColor} onPress={rightItem.onPress} />}
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
