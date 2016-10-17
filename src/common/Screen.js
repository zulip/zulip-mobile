import React from 'react';
import {
  // BackAndroid,
  View,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { popRoute } from '../nav/navActions';

import { styles } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

class Screen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
    title: string,
  }

  render() {
    const { keyboardAvoiding, title, nav, children } = this.props;
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

const mapStateToProps = (state) => ({
  nav: state.nav,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    popRoute,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Screen);
