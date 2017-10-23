/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';
import { BRAND_COLOR } from '../styles';
import errorImg from '../../static/img/500art.png';
import { Label, Screen } from '../common';

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    margin: 10,
    flex: 1,
  },
  image: {
    flex: 1,
    width: null,
  },
});

type Props = {};

export default class extends PureComponent<Props> {
  render() {
    return (
      <Screen title="Internal server Error">
        <Label style={styles.title} text="Internal server error (message)" />
        <Image source={errorImg} resizeMode="contain" style={styles.image} />
      </Screen>
    );
  }
}
