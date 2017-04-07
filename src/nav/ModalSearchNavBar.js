import React from 'react';
import {View, Text} from 'react-native';
import {connect} from 'react-redux';

import boundActions from '../boundActions';
import {CONTROL_SIZE} from '../common/platform';
import {BRAND_COLOR} from '../common/styles';
import {styles, SearchInput} from '../common';
import NavButton from './NavButton';

class ModalSearchNavBar extends React.Component {
  props: {
    nav: any,
    title: string,
    searchBar: boolean,
    searchBarOnChange: () => void,
  };

  state: {
    isSearchActive: boolean,
  };

  state = {
    isSearchActive: false,
  };

  changeSearchActiveState = () => {
    this.setState(prevState => ({
      isSearchActive: !prevState.isSearchActive,
    }));
  };

  render() {
    const {isSearchActive} = this.state;
    const {nav, title, popRoute, searchBarOnChange} = this.props;
    const {searchBar} = this.props;
    const showSearchInput = isSearchActive || !searchBar;
    const textStyle = [
      styles.navTitle,
      nav.index > 0 && showSearchInput && {marginRight: CONTROL_SIZE},
    ];

    return (
      <View style={styles.navBar}>
        {nav.index > 0 &&
          <NavButton
            name="ios-arrow-back"
            color={BRAND_COLOR}
            onPress={popRoute}
          />}
        {showSearchInput
          ? <SearchInput onChange={searchBarOnChange} />
          : <Text style={textStyle}>{title}</Text>}
        {searchBar &&
          <NavButton
            name="ios-search"
            color={BRAND_COLOR}
            onPress={this.changeSearchActiveState}
          />}
      </View>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
  }),
  boundActions
)(ModalSearchNavBar);
