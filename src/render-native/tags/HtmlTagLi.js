/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import styles from '../html/HtmlStyles';
import HtmlNodeText from '../html/HtmlNodeText';
import renderHtmlChildren from '../html/renderHtmlChildren';

const BULLET = '\u2022';

const customStyles = StyleSheet.create({
  text: {
    flexWrap: 'wrap',
    flex: 1,
    width: '100%',
    flexDirection: 'row',
  },
});

type Props = {
  style: StyleObj,
  actions: Actions,
  splitMessageText?: boolean,
};

export default class HtmlTagLi extends PureComponent<Props> {
  props: Props;

  render() {
    const { style, ...restProps } = this.props;

    return (
      <View style={[styles.li, style]}>
        <HtmlNodeText style={styles.bullet} data={` ${BULLET}  `} />
        <View style={customStyles.text}>{renderHtmlChildren({ ...restProps })}</View>
      </View>
    );
  }
}
