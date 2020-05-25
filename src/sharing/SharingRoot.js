/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

/**
 * This is a dummy component to by-pass some weird quirks of Android Activity
 * launches in a React Native context. The native code in
 * `ReceiveShareActivity.kt` finishes this activity quickly, after either
 * i) Sending events to an already open app in the background
 * ii) Launching `MainActivity` with some initial share data.
 */
class SharingRoot extends React.Component<{||}> {
  render() {
    return <View />;
  }
}

export default SharingRoot;
