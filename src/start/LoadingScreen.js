import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import styles, { BRAND_COLOR } from '../common/styles';

export default class LoadingScreen extends React.PureComponent {
  
  render() {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BRAND_COLOR} size="large" />
      </View>
    );
  }
}
