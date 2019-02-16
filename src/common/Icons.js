/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';
import type { Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

/*
 * This corresponds to the documented interface:
 * https://github.com/oblador/react-native-vector-icons/blob/v4.6.0/README.md#properties
 */
type IconProps = {|
  ...$Exact<$PropertyType<Text, 'props'>>,
  size?: number,
  color?: string,
|};

export type Icon = ComponentType<IconProps>;

export const IconHome: Icon = props => <Feather name="home" {...props} />;
export const IconStar: Icon = props => <Feather name="star" {...props} />;
export const IconMention: Icon = props => <Feather name="at-sign" {...props} />;
export const IconSearch: Icon = props => <Feather name="search" {...props} />;
export const IconDone: Icon = props => <Feather name="check" {...props} />;
export const IconCancel: Icon = props => <Feather name="slash" {...props} />;
export const IconTrash: Icon = props => <Feather name="trash-2" {...props} />;
export const IconWarning: Icon = props => <Feather name="alert-triangle" {...props} />;
export const IconSend: Icon = props => <MaterialIcon name="send" {...props} />;
export const IconMute: Icon = props => <MaterialIcon name="volume-off" {...props} />;
export const IconStream: Icon = props => <Feather name="hash" {...props} />;
export const IconPrivate: Icon = props => <Feather name="lock" {...props} />;
export const IconPrivateChat: Icon = props => <Feather name="mail" {...props} />;
export const IconDownArrow: Icon = props => <Feather name="chevron-down" {...props} />;
export const IconGoogle: Icon = props => <IoniconsIcon name="logo-google" {...props} />;
export const IconGitHub: Icon = props => <Feather name="github" {...props} />;
export const IconCross: Icon = props => <Feather name="x" {...props} />;
export const IconDiagnostics: Icon = props => <Feather name="activity" {...props} />;
export const IconNotifications: Icon = props => <Feather name="bell" {...props} />;
export const IconLanguage: Icon = props => <Feather name="globe" {...props} />;
export const IconNight: Icon = props => <Feather name="moon" {...props} />;
export const IconSettings: Icon = props => <Feather name="settings" {...props} />;
export const IconRight: Icon = props => <Feather name="chevron-right" {...props} />;
export const IconPlus: Icon = props => <Feather name="plus-circle" {...props} />;
export const IconLeft: Icon = props => <Feather name="chevron-left" {...props} />;
export const IconPeople: Icon = props => <Feather name="users" {...props} />;
export const IconImage: Icon = props => <Feather name="image" {...props} />;
export const IconCamera: Icon = props => <Feather name="camera" {...props} />;
export const IconTerminal: Icon = props => <Feather name="terminal" {...props} />;
export const IconMoreHorizontal: Icon = props => <Feather name="more-horizontal" {...props} />;

export default Feather;
