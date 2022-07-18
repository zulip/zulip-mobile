// @flow strict-local
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BRAND_COLOR } from '../styles';

type Props = {|
  +children: React.Node,
|};

export default function ZulipSafeAreaProvider(props: Props): React.Node {
  return (
    <SafeAreaProvider
      style={{
        // While waiting for the safe-area insets, this will
        // show. Best for it not to be a white flicker.
        backgroundColor: BRAND_COLOR,
      }}
    >
      {props.children}
    </SafeAreaProvider>
  );
}
