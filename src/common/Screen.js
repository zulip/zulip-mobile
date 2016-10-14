import React from 'react';
import {
  // BackAndroid,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';

import styles from '../common/styles';
import ModalNavBar from '../nav/ModalNavBar';

class Screen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
    onBack: () => void,
  }

  render() {
    const { keyboardAvoiding, onBack, children } = this.props;
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <ModalNavBar onBack={onBack} />
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

// const mapDispatchToProps = (dispatch, ownProps) =>
//   bindActionCreators({
//     addAccount,
//   }, dispatch);

export default connect(mapStateToProps)(Screen);
