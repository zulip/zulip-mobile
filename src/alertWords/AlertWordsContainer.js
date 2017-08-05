/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { AlertWords, Auth, GlobalState } from '../types';
import { BRAND_COLOR } from '../styles';
import AddAlertWordView from './AddAlertWordView';
import AlertWordsList from './AlertWordsList';
import { getAlertWords, getAuth } from '../selectors';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  divider: {
    margin: 8,
    height: 1,
    backgroundColor: BRAND_COLOR,
  },
});

class AlertWordsContainer extends PureComponent {
  props: {
    auth: Auth,
    alertWords: AlertWords,
  };

  render() {
    const { alertWords, auth } = this.props;
    return (
      <View style={componentStyles.wrapper}>
        <AddAlertWordView auth={auth} />
        <View style={componentStyles.divider} />
        <AlertWordsList alertWords={alertWords} auth={auth} />
      </View>
    );
  }
}

export default connect((state: GlobalState) => ({
  alertWords: getAlertWords(state),
  auth: getAuth(state),
}))(AlertWordsContainer);
