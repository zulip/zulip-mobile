/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';
import type { Text } from 'react-native';
import type { Color, IconProps as IconPropsBusted } from 'react-native-vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import type { FeatherGlyphs } from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

/**
 * The props actually accepted by icon components in r-n-vector-icons.
 *
 * This corresponds to the documented interface:
 *   https://github.com/oblador/react-native-vector-icons/blob/v6.6.0/README.md#properties
 *
 * Upstream has a .js.flow file which is meant to describe this.  But the
 * type definition there is wrong in a couple of ways:
 *  * it leaves most of the properties of `Text` unspecified, and just
 *    defines an inexact object type so that it's much looser than reality;
 *  * of the handful of properties it does mention, it defines one more
 *    narrowly than the actual `Text`, as `allowFontScaling?: boolean` when
 *    it should be `allowFontScaling?: ?boolean`.
 */
type IconProps<Glyphs: string> = {|
  ...$Exact<$PropertyType<Text, 'props'>>,
  size?: number,
  name: Glyphs,
  color?: Color,
|};

const fixIconType = <Glyphs: string>(
  iconSet: ComponentType<IconPropsBusted<Glyphs>>,
): ComponentType<IconProps<Glyphs>> => (iconSet: $FlowFixMe); // See comment above about wrong types.

/** Names acceptable for `Icon`. */
export type IconNames = FeatherGlyphs;

/** A component-type for the icon set we mainly use. */
export const Icon = fixIconType<IconNames>(Feather);

/** A (type for a) component-type like `Icon` but with `name` already specified. */
export type SpecificIconType = ComponentType<$Diff<IconProps<empty>, {| name: mixed |}>>;

const makeIcon = <Glyphs: string>(
  iconSet: ComponentType<IconPropsBusted<Glyphs>>,
  name: Glyphs,
): SpecificIconType => props => {
  const FixedIcon = fixIconType<Glyphs>(iconSet);
  return <FixedIcon name={name} {...props} />;
};

export const IconInbox = makeIcon(Feather, 'inbox');
export const IconMention = makeIcon(Feather, 'at-sign');
export const IconSearch = makeIcon(Feather, 'search');
export const IconDone = makeIcon(Feather, 'check');
export const IconCancel = makeIcon(Feather, 'slash');
export const IconTrash = makeIcon(Feather, 'trash-2');
export const IconSend = makeIcon(MaterialIcon, 'send');
export const IconMute = makeIcon(MaterialIcon, 'volume-off');
export const IconStream = makeIcon(Feather, 'hash');
export const IconPin = makeIcon(SimpleLineIcons, 'pin');
export const IconPrivate = makeIcon(Feather, 'lock');
export const IconPrivateChat = makeIcon(Feather, 'mail');
export const IconApple = makeIcon(IoniconsIcon, 'logo-apple');
export const IconGoogle = makeIcon(IoniconsIcon, 'logo-google');
export const IconGitHub = makeIcon(Feather, 'github');
export const IconWindows = makeIcon(IoniconsIcon, 'logo-windows');
export const IconDiagnostics = makeIcon(Feather, 'activity');
export const IconNotifications = makeIcon(Feather, 'bell');
export const IconLanguage = makeIcon(Feather, 'globe');
export const IconNight = makeIcon(Feather, 'moon');
export const IconSettings = makeIcon(Feather, 'settings');
export const IconRight = makeIcon(Feather, 'chevron-right');
export const IconPlusCircle = makeIcon(Feather, 'plus-circle');
export const IconLeft = makeIcon(Feather, 'chevron-left');
export const IconPeople = makeIcon(Feather, 'users');
export const IconImage = makeIcon(Feather, 'image');
export const IconCamera = makeIcon(Feather, 'camera');
export const IconFile = makeIcon(Feather, 'file');
export const IconTerminal = makeIcon(Feather, 'terminal');
export const IconMoreHorizontal = makeIcon(Feather, 'more-horizontal');
export const IconEdit = makeIcon(Feather, 'edit');
export const IconPlusSquare = makeIcon(Feather, 'plus-square');
