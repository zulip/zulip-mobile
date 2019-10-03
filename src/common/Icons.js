/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';
import type { Text } from 'react-native';
import type { Color } from 'react-native-vector-icons';
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

export type IconNames = FeatherGlyphs;

/** The type of an Icon whose `name` has already been specified. */
export type IconType = ComponentType<$Diff<IconProps<IconNames>, {| name: mixed |}>>;

/* $FlowFixMe: See comments above. */
export const Icon: ComponentType<IconProps<IconNames>> = Feather;

export const IconInbox: IconType = props => <Feather name="inbox" {...props} />;
export const IconStar: IconType = props => <Feather name="star" {...props} />;
export const IconMention: IconType = props => <Feather name="at-sign" {...props} />;
export const IconSearch: IconType = props => <Feather name="search" {...props} />;
export const IconDone: IconType = props => <Feather name="check" {...props} />;
export const IconCancel: IconType = props => <Feather name="slash" {...props} />;
export const IconTrash: IconType = props => <Feather name="trash-2" {...props} />;
export const IconWarning: IconType = props => <Feather name="alert-triangle" {...props} />;
export const IconSend: IconType = props => <MaterialIcon name="send" {...props} />;
export const IconMute: IconType = props => <MaterialIcon name="volume-off" {...props} />;
export const IconStream: IconType = props => <Feather name="hash" {...props} />;
export const IconPin: IconType = props => <SimpleLineIcons name="pin" {...props} />;
export const IconPrivate: IconType = props => <Feather name="lock" {...props} />;
export const IconPrivateChat: IconType = props => <Feather name="mail" {...props} />;
export const IconDownArrow: IconType = props => <Feather name="chevron-down" {...props} />;
export const IconGoogle: IconType = props => <IoniconsIcon name="logo-google" {...props} />;
export const IconGitHub: IconType = props => <Feather name="github" {...props} />;
export const IconWindows: IconType = props => <IoniconsIcon name="logo-windows" {...props} />;
export const IconCross: IconType = props => <Feather name="x" {...props} />;
export const IconDiagnostics: IconType = props => <Feather name="activity" {...props} />;
export const IconNotifications: IconType = props => <Feather name="bell" {...props} />;
export const IconLanguage: IconType = props => <Feather name="globe" {...props} />;
export const IconNight: IconType = props => <Feather name="moon" {...props} />;
export const IconSettings: IconType = props => <Feather name="settings" {...props} />;
export const IconRight: IconType = props => <Feather name="chevron-right" {...props} />;
export const IconPlusCircle: IconType = props => <Feather name="plus-circle" {...props} />;
export const IconLeft: IconType = props => <Feather name="chevron-left" {...props} />;
export const IconPeople: IconType = props => <Feather name="users" {...props} />;
export const IconImage: IconType = props => <Feather name="image" {...props} />;
export const IconCamera: IconType = props => <Feather name="camera" {...props} />;
export const IconFile: IconType = props => <Feather name="file" {...props} />;
export const IconTerminal: IconType = props => <Feather name="terminal" {...props} />;
export const IconMoreHorizontal: IconType = props => <Feather name="more-horizontal" {...props} />;
export const IconEdit: IconType = props => <Feather name="edit" {...props} />;
export const IconPlusSquare: IconType = props => <Feather name="plus-square" {...props} />;
export const IconPlus: IconType = props => <Feather name="plus" {...props} />;
