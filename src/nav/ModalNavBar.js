import React from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { CONTROL_SIZE } from '../common/platform';
import { styles } from '../common';
import NavButton from './NavButton';

class ModalNavBar extends React.Component {

  props: {
    nav: any,
    title: string,
    popRoute: () => void,
  }

  render() {
    const { nav, title, popRoute } = this.props;
    const textStyle = [styles.navTitle, nav.index > 0 && { marginRight: CONTROL_SIZE }];

    return (
      <View style={styles.navBar}>
        {nav.index > 0 &&
          <NavButton name="ios-arrow-back" onPress={popRoute} />
        }
        <Text style={textStyle}>
          {title}
        </Text>
      </View>
    );
  }
}

export default connect(
  (state) => ({
    nav: state.nav,
  }),
  boundActions,
)(ModalNavBar);
