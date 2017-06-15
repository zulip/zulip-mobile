import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';

import styles, { BRAND_COLOR } from '../styles';

export default class LoadingScreen extends React.PureComponent {
  render() {
    return (
      <View style={styles.center}>
        <Image style={[styles.image]}
          source={require('../../static/img/logo.png')}
        />
      </View>
    );
  }
}
