import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import styles, { CONTROL_SIZE } from '../styles';
import { Label } from '../common';
import NavButton from './NavButton';

class ModalNavBar extends React.Component {

  props: {
    nav: any,
    title: string,
  }

  render() {
    const { nav, title, navigateBack } = this.props;
    const textStyle = [styles.navTitle, nav.index > 0 && { marginRight: CONTROL_SIZE }];

    return (
      <View style={styles.navBar}>
        {nav.index > 0 &&
          <NavButton
            name="ios-arrow-back"
            onPress={navigateBack}
          />
        }
        <Label style={textStyle} text={title} />
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
