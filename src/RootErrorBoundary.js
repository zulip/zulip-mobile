/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, Text, TextInput, ScrollView, Button, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';

import * as logging from './utils/logging';
import { type JSONableDict } from './utils/jsonable';

type Props = $ReadOnly<{|
  children: Node,
|}>;

type State = $ReadOnly<{|
  error: Error | null,
|}>;

/**
 * A React error boundary to go as near the root as possible.
 *
 * React error boundaries [1] shouldn't be used as part of a normal
 * control flow; it's best and simplest to strive to keep our
 * component hierarchy error-free. But mistakes happen, and when they
 * do, we don't want to leave the user empty-handed in debugging
 * conversations when we can have the app provide some useful
 * information. So, cast a wide net for errors at the edge.
 *
 * Implemented carefully so that we don't get a white-screen crash
 * from this component itself. It doesn't depend on any external setup
 * except Sentry's initialization (without which we'd have no hope of
 * reporting the error to Sentry), e.g., from other React components
 * in the tree. N.B., this means things like proper safe-area
 * handling, light-dark theming, and translation won't work.
 *
 * [1] https://reactjs.org/docs/error-boundaries.html#how-about-event-handlers
 */
export default class ErrorBoundary extends React.PureComponent<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: mixed) {
    // The error was caught [1], so Sentry wouldn't hear about it
    // unless we intervene.
    //
    // [1] Er, possibly it gets rethrown in development mode. See
    //     https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/:
    //     "In development mode, React will rethrow errors caught
    //     within an error boundary. This will result in errors being
    //     reported twice to Sentry with the above setup, but this
    //     won’t occur in your production build."
    logging.error(
      error,
      // Pretend errorInfo is a JSONableDict.
      //
      // Empirically, Sentry will still be notified even if the value at
      // some key in errorInfo is non-JSONable. It seems like Sentry calls
      // JSON.stringify(value) first, and if that fails it calls
      // value.toString(). If *that* fails (either because value.toString
      // isn't a function, or if it's a function that throws an error)…then
      // the "Additional Data" section in Sentry's UI will have an error box
      // that says "There was a problem rendering this component". But in
      // all cases, the Sentry event successfully makes it to Sentry.
      //
      // $FlowIgnore[incompatible-cast]
      (errorInfo: JSONableDict),
    );
  }

  state: State = {
    error: null,
  };

  render(): Node {
    const { error } = this.state;
    if (error) {
      const details = `${error.toString()}

Component Stack:
${
  /* $FlowFixMe[prop-missing] - I've seen this empirically in debug and
     release builds on iOS and Android */
  error.componentStack ?? '<none available>'
}

Call Stack:

${error.stack}`;

      return (
        <View
          style={{
            // Fill the whole screen (well, the parent, which is
            // hopefully the whole screen).
            flex: 1,

            alignItems: 'center',
            justifyContent: 'center',

            // Simulate `SafeAreaView` without counting on
            // `SafeAreaProvider`.
            padding: 50,
          }}
        >
          <Text>Ouch, there was an error.</Text>
          <Button
            title="Copy details"
            // If something in `onPress` fails, we shouldn't get a
            // white screen [1]: "Unlike the render method and
            // lifecycle methods, the event handlers don’t happen
            // during rendering. So if they throw, React still knows
            // what to display on the screen."
            //
            // [1] https://reactjs.org/docs/error-boundaries.html#how-about-event-handlers.
            onPress={() => {
              Clipboard.setString(details);
              Toast.show('Copied!', Toast.SHORT);
            }}
          />
          {Platform.select({
            ios: (
              <TextInput
                style={{
                  // To not grow outside the parent View
                  flex: 1,

                  // This doesn't seem to work on Android
                  fontFamily: 'Courier',
                }}
                multiline
                editable={false}
                value={details}
              />
            ),
            android: (
              // For Android-only symptoms like
              // facebook/react-native#23117
              <ScrollView>
                <TextInput
                  style={{
                    // To not grow outside the parent View
                    flex: 1,

                    // This doesn't seem to work on iOS
                    fontFamily: 'monospace',
                  }}
                  multiline
                  editable={false}
                  value={details}
                />
              </ScrollView>
            ),
          })}
        </View>
      );
    }
    return this.props.children;
  }
}
