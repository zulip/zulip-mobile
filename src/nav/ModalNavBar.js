/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch, Context, GlobalState, LocalizableText } from '../types';
import styles, { NAVBAR_SIZE } from '../styles';
import Label from '../common/Label';
import { getCanGoBack } from '../selectors';
import NavButton from './NavButton';
import { navigateBack } from '../actions';
import { connectPreserveOnBackOption } from '../utils/redux';

type Props = {|
  dispatch: Dispatch,
  canGoBack: boolean,
  title: LocalizableText,
|};

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
      <View style={[contextStyles.navBar]}>
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

export default connect(
  (state: GlobalState) => ({
    canGoBack: getCanGoBack(state),
  }),
  null,
  null,
  connectPreserveOnBackOption,
)(ModalNavBar);
