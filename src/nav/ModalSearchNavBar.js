import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Foundation';

import boundActions from '../boundActions';
import { CONTROL_SIZE } from '../common/platform';
import { BRAND_COLOR } from '../common/styles';
import { styles, Touchable, SearchInput } from '../common';
import NavButton from './NavButton';

const navBarStyles = StyleSheet.create({
  touchable: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

class ModalSearchNavBar extends React.Component {
  props: {
    nav: any,
    title: string,
    isOnDemandSearchBarApplied: boolean,
    searchBarOnChange: () => void
  };

  state: {
    isSearchEnabled: boolean
  };

  constructor() {
    super();
    this.state = {
      isSearchEnabled: false,
    };
  }

  changeSearchEnableState = () => {
    this.setState({
      isSearchEnabled: !this.state.isSearchEnabled
    });
  };

  render() {
    const { isSearchEnabled } = this.state;
    const { nav, title, popRoute, searchBarOnChange } = this.props;
    const { isOnDemandSearchBarApplied } = this.props;
    const textStyle = [styles.navTitle, nav.index > 0 && { marginRight: CONTROL_SIZE }];

    let middleComponent;
    if (isSearchEnabled || !isOnDemandSearchBarApplied) {
      middleComponent = <SearchInput onChange={searchBarOnChange} />;
    } else {
      middleComponent = <Text style={textStyle}>{title}</Text>;
    }

    return (
      <View style={styles.navBar}>
        {nav.index > 0 &&
          <NavButton name="ios-arrow-back" color={BRAND_COLOR} onPress={popRoute} />
        }
        { middleComponent }
        { isOnDemandSearchBarApplied &&
          <Touchable onPress={this.changeSearchEnableState} style={navBarStyles.touchable}>
            <Icon name="magnifying-glass" size={25} color={BRAND_COLOR} res />
          </Touchable>
        }
      </View>
    );
  }
}

export default connect(
  (state) => ({
    nav: state.nav,
  }),
  boundActions,
)(ModalSearchNavBar);
