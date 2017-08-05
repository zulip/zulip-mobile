/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel, Touchable } from '../common';
import { IconDelete } from '../common/Icons';
import { BRAND_COLOR } from '../styles';
import type { Auth } from '../types';
import apiRemoveAlertWord from '../api/removeAlertWord';

const componentStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    margin: 8,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertWordText: {
    fontSize: 14,
  },
  removeTouchable: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class AlertItem extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    auth: Auth,
    alertWord: string,
  };

  removeAlertWord = () => {
    const { auth, alertWord } = this.props;
    apiRemoveAlertWord(auth, alertWord);
  };

  render() {
    const { alertWord } = this.props;

    return (
      <View style={[componentStyles.row, this.context.styles.cardView]}>
        <View style={componentStyles.textWrapper}>
          <RawLabel style={componentStyles.alertWordText} text={alertWord} />
        </View>
        <Touchable
          style={[componentStyles.removeTouchable, this.context.styles.backgroundColor]}
          onPress={() => this.removeAlertWord()}>
          <IconDelete size={20} color={BRAND_COLOR} />
        </Touchable>
      </View>
    );
  }
}
