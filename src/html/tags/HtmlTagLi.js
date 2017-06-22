import React from 'react';
import { StyleSheet, View } from 'react-native';

import styles from '../HtmlStyles';
import HtmlNodeText from '../HtmlNodeText';
import renderHtmlChildren from '../renderHtmlChildren';

const BULLET = '\u2022';

const customStyles = StyleSheet.create({
  liText: {
    flex: 1,
  }
});

export default ({ style, ...restProps }) => (
  <View style={style}>
    <HtmlNodeText style={styles.bullet} data={BULLET} />
    <View style={customStyles.liText}>
      {renderHtmlChildren({ ...restProps })}
    </View>
  </View>
);
