/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { useSelector } from '../react-redux';
import { getLoading } from '../selectors';
import { Label, LoadingIndicator } from '.';
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

type Props = $ReadOnly<{|
  spinnerColor?: 'black' | 'white' | 'default',
  textColor?: string,
  backgroundColor?: string,
|}>;

/**
 * Display a notice that the app is connecting to the server, when appropriate.
 */
export default function LoadingBanner(props: Props): Node {
  const loading = useSelector(getLoading);
  const themeContext = useContext(ThemeContext);

  if (!loading) {
    return <View key={key} style={styles.none} />;
  }
  const {
    spinnerColor = 'default',
    textColor = themeContext.color,
    backgroundColor = themeContext.backgroundColor,
  } = props;
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
