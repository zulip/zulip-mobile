import React from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';

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
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

export default class Screen extends React.Component {

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
