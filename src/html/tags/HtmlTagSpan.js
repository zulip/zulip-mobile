/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, StyleObj } from '../../types';
import { getOwnEmail } from '../../selectors';
import renderHtmlChildren from '../renderHtmlChildren';
import styles from '../HtmlStyles';

class HtmlTagSpan extends PureComponent {
  props: {
    style?: StyleObj,
    actions?: Actions,
    cascadingStyle?: StyleObj,
  };

  mentionButtonRefersToSelf = () => {
    const { attribs, ownEmail } = this.props;
    return attribs && attribs.class === 'user-mention' && attribs['data-user-email'] === ownEmail;
  };

  render() {
    const { style, cascadingStyle, ...restProps } = this.props;
    return (
      <View
        style={[
          style,
          cascadingStyle,
          this.mentionButtonRefersToSelf() && styles['user-mention-me'],
        ]}>
        {renderHtmlChildren({ ...restProps })}
      </View>
    );
  }
}

export default connect(
  state => ({
    ownEmail: getOwnEmail(state),
  }),
  {},
)(HtmlTagSpan);
