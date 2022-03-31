/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';
import { Text } from 'react-native';
import type { IconProps as IconPropsBusted } from 'react-native-vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import type { FeatherGlyphs } from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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
  ...$Exact<React$ElementConfig<typeof Text>>,
  name: Glyphs,

  /**
   * The size, as a font size.
   *
   * Upstream accepts a missing size.  But really a default size doesn't
   * make sense, so we make it required.
   */
  size: number,

  color?: string,
|};

const fixIconType = <Glyphs: string>(
  iconSet: ComponentType<IconPropsBusted<Glyphs>>,
): ComponentType<IconProps<Glyphs>> => (iconSet: $FlowFixMe); // See comment above about wrong types.

/** Names acceptable for `Icon`. */
export type IconNames = FeatherGlyphs;

/** A component-type for the icon set we mainly use. */
export const Icon: ComponentType<IconProps<IconNames>> = fixIconType<IconNames>(Feather);

/** A (type for a) component-type like `Icon` but with `name` already specified. */
export type SpecificIconType = ComponentType<$Diff<IconProps<empty>, {| name: mixed |}>>;

const makeIcon = <Glyphs: string>(
  iconSet: ComponentType<IconPropsBusted<Glyphs>>,
  name: Glyphs,
): SpecificIconType => props => {
  const FixedIcon = fixIconType<Glyphs>(iconSet);
  return <FixedIcon name={name} {...props} />;
};

export const IconInbox: SpecificIconType = makeIcon(Feather, 'inbox');
export const IconMention: SpecificIconType = makeIcon(Feather, 'at-sign');
export const IconSearch: SpecificIconType = makeIcon(Feather, 'search');
export const IconDone: SpecificIconType = makeIcon(Feather, 'check');
export const IconCancel: SpecificIconType = makeIcon(Feather, 'slash');
export const IconTrash: SpecificIconType = makeIcon(Feather, 'trash-2');
export const IconSend: SpecificIconType = makeIcon(MaterialIcon, 'send');
export const IconMute: SpecificIconType = makeIcon(MaterialIcon, 'volume-off');
export const IconStream: SpecificIconType = makeIcon(Feather, 'hash');
export const IconPin: SpecificIconType = makeIcon(SimpleLineIcons, 'pin');
export const IconPrivate: SpecificIconType = makeIcon(Feather, 'lock');
export const IconPrivateChat: SpecificIconType = makeIcon(Feather, 'mail');
export const IconApple: SpecificIconType = makeIcon(IoniconsIcon, 'logo-apple');
export const IconGoogle: SpecificIconType = makeIcon(IoniconsIcon, 'logo-google');
export const IconGitHub: SpecificIconType = makeIcon(Feather, 'github');
export const IconWindows: SpecificIconType = makeIcon(IoniconsIcon, 'logo-windows');
export const IconDiagnostics: SpecificIconType = makeIcon(Feather, 'activity');
export const IconNotifications: SpecificIconType = makeIcon(Feather, 'bell');
export const IconLanguage: SpecificIconType = makeIcon(Feather, 'globe');
export const IconSettings: SpecificIconType = makeIcon(Feather, 'settings');
export const IconRight: SpecificIconType = makeIcon(Feather, 'chevron-right');
export const IconPlusCircle: SpecificIconType = makeIcon(Feather, 'plus-circle');
export const IconLeft: SpecificIconType = makeIcon(Feather, 'chevron-left');
export const IconPeople: SpecificIconType = makeIcon(Feather, 'users');
export const IconPerson: SpecificIconType = makeIcon(Feather, 'user');
export const IconImage: SpecificIconType = makeIcon(Feather, 'image');
export const IconCamera: SpecificIconType = makeIcon(Feather, 'camera');
export const IconTerminal: SpecificIconType = makeIcon(Feather, 'terminal');
export const IconMoreHorizontal: SpecificIconType = makeIcon(Feather, 'more-horizontal');
export const IconEdit: SpecificIconType = makeIcon(Feather, 'edit');
export const IconPlusSquare: SpecificIconType = makeIcon(Feather, 'plus-square');
export const IconVideo: SpecificIconType = makeIcon(Feather, 'video');
export const IconUserMuted: SpecificIconType = makeIcon(FontAwesome, 'user');
export const IconAttach: SpecificIconType = makeIcon(Feather, 'paperclip');
export const IconAttachment: SpecificIconType = makeIcon(IoniconsIcon, 'document-attach-outline');
export const IconGroup: SpecificIconType = makeIcon(FontAwesome, 'group');
export const IconWebPublic: SpecificIconType = makeIcon(FontAwesome, 'globe');
