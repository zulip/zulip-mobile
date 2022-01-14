/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Platform } from 'react-native';

import { useNavigation } from '../react-navigation';
import NavButton from './NavButton';

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
 *
 * This is a {@link NavButton}.  See there for details on how to lay it out.
 */
// TODO: on iOS, give the right label for a back button
export default function NavBarBackButton(props: {| +color?: string |}): Node {
  const { color } = props;
  const iconName = Platform.OS === 'android' ? 'arrow-left' : 'chevron-left';

  const navigation = useNavigation();

  return (
    <NavButton
      name={iconName}
      accessibilityLabel="Navigate up"
      color={color}
      onPress={() => {
        navigation.goBack();
      }}
    />
  );
}
