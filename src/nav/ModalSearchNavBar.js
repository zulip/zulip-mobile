/* @flow */
import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { PopRouteAction } from '../types';
import boundActions from '../boundActions';
import styles, { CONTROL_SIZE } from '../styles';
import { Label, SearchInput } from '../common';
import NavButton from './NavButton';

class ModalSearchNavBar extends React.Component {

  props: {
    nav: any,
    title: string,
    searchBar: boolean,
    searchBarOnChange: () => void,
    popRoute: PopRouteAction,
  };

  state: {
    isSearchActive: boolean,
  };

  constructor(props) {
    super(props);
    this.state = {
      isSearchActive: false,
    };
  }

  changeSearchActiveState = () => {
    this.setState(prevState => ({
      isSearchActive: !prevState.isSearchActive
    }));
  };

  render() {
    const { isSearchActive } = this.state;
    const { nav, title, popRoute, searchBarOnChange } = this.props;
    const { searchBar } = this.props;
    const showSearchInput = isSearchActive || !searchBar;
    const textStyle = [
      styles.navTitle,
      nav.index > 0 && showSearchInput && { marginRight: CONTROL_SIZE }
    ];

    return (
      <View style={styles.navBar}>
        {nav.index > 0 &&
          <NavButton name="ios-arrow-back" onPress={popRoute} />
        }
        {showSearchInput ?
          <SearchInput onChange={searchBarOnChange} /> :
          <Label style={textStyle} text={title} />
        }
        {searchBar &&
          <NavButton
            name="ios-search"
            onPress={this.changeSearchActiveState}
          />
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
