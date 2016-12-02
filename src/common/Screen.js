import React from 'react';
import {
  View,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';

import { styles } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

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
