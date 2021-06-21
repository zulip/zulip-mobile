/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { getLoading } from '../selectors';
// eslint-disable-next-line import/no-useless-path-segments
import { Label, LoadingIndicator } from './'; // Like '.'; see #4818.
import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';

const key = 'LoadingBanner';

const styles = createStyleSheet({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(6, 98%, 57%)',
  },
  none: { display: 'none' },
});

type SelectorProps = $ReadOnly<{|
  loading: boolean,
|}>;

type Props = $ReadOnly<{|
  spinnerColor?: 'black' | 'white' | 'default',
  textColor?: string,
  backgroundColor?: string,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * Display a notice that the app is connecting to the server, when appropriate.
 */
class LoadingBanner extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    if (!this.props.loading) {
      return <View key={key} style={styles.none} />;
    }
    const {
      spinnerColor = 'default',
      textColor = this.context.color,
      backgroundColor = this.context.backgroundColor,
    } = this.props;
    const style = {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor,
    };
    return (
      <View key={key} style={style}>
        <View>
          <LoadingIndicator size={14} color={spinnerColor} />
        </View>
        <Label
          style={{
            fontSize: 14,
            margin: 2,
            color: textColor,
          }}
          text="Connecting..."
        />
      </View>
    );
  }
}

export default connect<SelectorProps, _, _>(state => ({
  loading: getLoading(state),
}))(LoadingBanner);
