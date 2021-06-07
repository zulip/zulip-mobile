/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Bar from 'react-native-progress/Bar';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getLoading } from '../selectors';
import type { ThemeData } from '../styles';
import { ThemeContext, BRAND_COLOR, LOADING_BAR_THICKNESS } from '../styles';

type SelectorProps = $ReadOnly<{|
  loading: boolean,
|}>;

type Props = $ReadOnly<{|
  color: string,
  unfilledColor?: string,
  viewStyle?: ViewStyleProp,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * Display a indeterminate loading-bar while the app is connecting to the server, when appropriate.
 */
class LoadingBar extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  static defaultProps = {
    color: BRAND_COLOR,
  };

  render() {
    const { loading, unfilledColor, viewStyle, color } = this.props;

    return (
      <View style={viewStyle}>
        {loading && (
          <Bar
            useNativeDriver
            indeterminate
            indeterminateAnimationDuration={750}
            borderRadius={0}
            borderWidth={0}
            height={LOADING_BAR_THICKNESS}
            width={null}
            color={color}
            unfilledColor={unfilledColor ?? this.context.backgroundColor}
          />
        )}
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>(state => ({
  loading: getLoading(state),
}))(LoadingBar);
