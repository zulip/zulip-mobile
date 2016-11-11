import React from 'react';
import {
  View,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { styles } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

class Screen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
    title: string,
  }

  render() {
    const { keyboardAvoiding, title, nav, children, popRoute } = this.props;
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <ModalNavBar title={title} popRoute={popRoute} nav={nav} />
        <WrapperView style={styles.container} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect(
  (state) => ({
    nav: state.nav,
  }),
  boundActions,
)(Screen);
