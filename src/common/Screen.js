import React from 'react';
import {
  // BackAndroid,
  View,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { connect } from 'react-redux';

import { styles } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

class Screen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
    title: string,
    onBack: () => void,
  }

  render() {
    const { keyboardAvoiding, title, onBack, children } = this.props;
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <StatusBar backgroundColor="blue" barStyle="light-content" />
        <ModalNavBar title={title} onBack={onBack} />
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
