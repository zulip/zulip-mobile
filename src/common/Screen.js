import React from 'react';
import {
  // BackAndroid,
  View,
  KeyboardAvoidingView,
} from 'react-native';

import styles from '../common/styles';
import ModalNavBar from '../nav/ModalNavBar';

export default class Screen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
  }

  render() {
    const { keyboardAvoiding, children } = this.props;
    // behavior="padding"
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <WrapperView style={styles.screen}>
        <ModalNavBar />
        {children}
      </WrapperView>
    );
  }
}


const mapStateToProps = (state) => ({
  routes: state.accountlist,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    addAccount,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AccountPickScreen);
