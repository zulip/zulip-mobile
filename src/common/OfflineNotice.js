/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getSession } from '../selectors';
import Label from './Label';

const key = 'OfflineNotice';

const styles = createStyleSheet({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(6, 98%, 57%)',
  },
  text: {
    fontSize: 14,
    color: 'white',
    margin: 2,
  },
  none: { display: 'none' },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  isOnline: boolean,
|}>;

/**
 * Displays a notice that the app is working in offline mode.
 * Not rendered if state is 'online'.
 *
 * @prop isOnline - Provide the online/offline state.
 */
class OfflineNotice extends PureComponent<Props> {
  render() {
    const { isOnline } = this.props;
    if (isOnline) {
      return <View key={key} style={styles.none} />;
    }

    return (
      <View key={key} style={styles.block}>
        <Label style={styles.text} text="No Internet connection" />
      </View>
    );
  }
}

export default connect(state => ({
  isOnline: getSession(state).isOnline,
}))(OfflineNotice);
