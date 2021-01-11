/* @flow strict-local */
import React from 'react';

import { navigateBack } from '../actions';
import NavButton from './NavButton';
import * as NavigationService from './NavigationService';

/**
 * The button for the start of the app bar, to return to previous screen.
 *
 * This serves as what Android calls the "Up button", and iOS calls the
 * "back button".  It navigates back to the previous screen within the app.
 *
 * For background, see Android, iOS, and Material guidance on navigation:
 * https://developer.android.com/guide/navigation/navigation-principles
 * https://developer.apple.com/design/human-interface-guidelines/ios/app-architecture/navigation/
 * https://developer.apple.com/design/human-interface-guidelines/ios/bars/navigation-bars/
 * https://material.io/design/navigation/understanding-navigation.html
 */
// TODO: on iOS, show the right icon for a back button
// TODO: on iOS, give the right label for a back button
export default function NavBarBackButton(props: {| +color?: string |}) {
  const { color } = props;
  return (
    <NavButton
      name="arrow-left"
      accessibilityLabel="Navigate up"
      color={color}
      onPress={() => {
        NavigationService.dispatch(navigateBack());
      }}
    />
  );
}
