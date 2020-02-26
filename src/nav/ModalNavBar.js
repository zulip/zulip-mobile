/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context, LocalizableText } from '../types';
import { connect } from '../react-redux';
import styles, { NAVBAR_SIZE } from '../styles';
import Label from '../common/Label';
import NavButton from './NavButton';
import { navigateBack } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  canGoBack: boolean,
  title: LocalizableText,
|}>;

class ModalNavBar extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { dispatch, canGoBack, title } = this.props;
    const textStyle = [
      styles.navTitle,
      canGoBack ? { marginRight: NAVBAR_SIZE } : { marginLeft: 16 },
    ];

    return (
      <View
        style={[
          {
            borderColor: 'hsla(0, 0%, 50%, 0.25)',
            flexDirection: 'row',
            height: NAVBAR_SIZE,
            alignItems: 'center',
            borderBottomWidth: 1,
            backgroundColor: contextStyles.backgroundColor.backgroundColor,
          },
        ]}
      >
        {canGoBack && (
          <NavButton
            name="arrow-left"
            onPress={() => {
              dispatch(navigateBack());
            }}
          />
        )}
        <View style={styles.flexedLeftAlign}>
          <Label style={textStyle} text={title} numberOfLines={1} ellipsizeMode="tail" />
        </View>
      </View>
    );
  }
}

export default connect()(ModalNavBar);
