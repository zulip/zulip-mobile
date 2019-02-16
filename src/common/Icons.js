/* @flow strict-local */
import React from 'react';
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

export const IconHome = (props: IconProps) => <Feather name="home" {...props} />;
export const IconStar = (props: IconProps) => <Feather name="star" {...props} />;
export const IconMention = (props: IconProps) => <Feather name="at-sign" {...props} />;
export const IconSearch = (props: IconProps) => <Feather name="search" {...props} />;
export const IconDone = (props: IconProps) => <Feather name="check" {...props} />;
export const IconCancel = (props: IconProps) => <Feather name="slash" {...props} />;
export const IconTrash = (props: IconProps) => <Feather name="trash-2" {...props} />;
export const IconWarning = (props: IconProps) => <Feather name="alert-triangle" {...props} />;
export const IconSend = (props: IconProps) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props: IconProps) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props: IconProps) => <Feather name="hash" {...props} />;
export const IconPrivate = (props: IconProps) => <Feather name="lock" {...props} />;
export const IconPrivateChat = (props: IconProps) => <Feather name="mail" {...props} />;
export const IconDownArrow = (props: IconProps) => <Feather name="chevron-down" {...props} />;
export const IconGoogle = (props: IconProps) => <IoniconsIcon name="logo-google" {...props} />;
export const IconGitHub = (props: IconProps) => <Feather name="github" {...props} />;
export const IconCross = (props: IconProps) => <Feather name="x" {...props} />;
export const IconDiagnostics = (props: IconProps) => <Feather name="activity" {...props} />;
export const IconNotifications = (props: IconProps) => <Feather name="bell" {...props} />;
export const IconLanguage = (props: IconProps) => <Feather name="globe" {...props} />;
export const IconNight = (props: IconProps) => <Feather name="moon" {...props} />;
export const IconSettings = (props: IconProps) => <Feather name="settings" {...props} />;
export const IconRight = (props: IconProps) => <Feather name="chevron-right" {...props} />;
export const IconPlus = (props: IconProps) => <Feather name="plus-circle" {...props} />;
export const IconLeft = (props: IconProps) => <Feather name="chevron-left" {...props} />;
export const IconPeople = (props: IconProps) => <Feather name="users" {...props} />;
export const IconImage = (props: IconProps) => <Feather name="image" {...props} />;
export const IconCamera = (props: IconProps) => <Feather name="camera" {...props} />;
export const IconTerminal = (props: IconProps) => <Feather name="terminal" {...props} />;
export const IconMoreHorizontal = (props: IconProps) => (
  <Feather name="more-horizontal" {...props} />
);

export default Feather;
