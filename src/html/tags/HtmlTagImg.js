import React, { Component } from 'react';
import { Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { getResource } from '../../utils/url';
import { Touchable } from '../../common';
import boundActions from '../../boundActions';

const styles = StyleSheet.create({
  img: {
    width: 260,
    height: 100,
  },
});

class HtmlTagImg extends Component {
  render() {
    const { style, src, auth, pushRoute, message } = this.props;
    const fullUrl = getResource(src, auth);
    return (
      <Touchable onPress={() => pushRoute('light-box', { fullUrl, auth, message })}>
        <Image source={fullUrl} resizeMode="contain" style={[styles.img, style]} />
      </Touchable>
    );
  }
}

export default connect(null, boundActions)(HtmlTagImg);
