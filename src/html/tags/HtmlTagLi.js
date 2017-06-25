import React from 'react';
import { StyleSheet, View } from 'react-native';

import styles from '../HtmlStyles';
import HtmlNodeText from '../HtmlNodeText';
import renderHtmlChildren from '../renderHtmlChildren';

const BULLET = '\u2022';

const customStyles = StyleSheet.create({
  text: {
    flexWrap: 'wrap',
    flex: 1,
    width: '100%',
    flexDirection: 'row',
  }
});

export default ({ style, ...restProps }) => (
  <View style={[styles.li, style]}>
    <HtmlNodeText style={styles.bullet} data={BULLET} />
    <View style={customStyles.text}>
      {renderHtmlChildren({ ...restProps })}
    </View>
  </View>
);
