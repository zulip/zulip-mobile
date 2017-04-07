import React from 'react';
import {connect} from 'react-redux';
import {View, StatusBar, StyleSheet, KeyboardAvoidingView} from 'react-native';

import ModalNavBar from '../nav/ModalNavBar';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  navigationCard: {
    backgroundColor: 'white',
    shadowColor: 'transparent',
  },
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

class Screen extends React.Component {
  props: {
    keyboardAvoiding: boolean,
    title: string,
  };

  render() {
    const {keyboardAvoiding, title, nav, children, popRoute} = this.props;
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <StatusBar
          barStyle="dark-content"
          hidden={this.props.orientation === 'LANDSCAPE'}
        />
        <ModalNavBar title={title} popRoute={popRoute} nav={nav} />
        <WrapperView style={styles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect(state => ({
  orientation: state.app.orientation,
}))(Screen);
