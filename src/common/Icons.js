/* @flow */
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

type Icontype = {
  size?: number,
  color?: string,
  style?: StyleObj
}

export const IconHome = (props:Icontype) => <Feather name="home" {...props} />;
export const IconStar = (props: Icontype) => <Feather name="star" {...props} />;
export const IconMention = (props: Icontype) => <Feather name="at-sign" {...props} />;
export const IconSearch = (props: Icontype) => <Feather name="search" {...props} />;
export const IconDone = (props: Icontype) => <Feather name="check" {...props} />;
export const IconCancel = (props: Icontype) => <Feather name="slash" {...props} />;
export const IconTrash = (props: Icontype) => <Feather name="trash-2" {...props} />;
export const IconWarning = (props: Icontype) => <Feather name="alert-triangle" {...props} />;
export const IconSend = (props:Icontype) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props:Icontype) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props: Icontype) => <Feather name="hash" {...props} />;
export const IconPrivate = (props: Icontype) => <Feather name="lock" {...props} />;
export const IconPrivateChat = (props: Icontype) => <Feather name="mail" {...props} />;
export const IconDownArrow = (props: Icontype) => <Feather name="chevron-down" {...props} />;
export const IconGoogle = (props: Icontype) => <IoniconsIcon name="logo-google" {...props} />;
export const IconGitHub = (props: Icontype) => <Feather name="github" {...props} />;
export const IconCross = (props: Icontype) => <Feather name="x" {...props} />;
export const IconSettings = (props: Icontype) => <Feather name="settings" {...props} />;
export const IconRight = (props: Icontype) => <Feather name="chevron-right" {...props} />;
export const IconPlus = (props: Icontype) => <Feather name="plus-circle" {...props} />;
export const IconLeft = (props: Icontype) => <Feather name="chevron-left" {...props} />;
export const IconPeople = (props: Icontype) => <Feather name="users" {...props} />;
export const IconImage = (props: Icontype) => <Feather name="image" {...props} />;
export const IconCamera = (props: Icontype) => <Feather name="camera" {...props} />;
export const IconTerminal = (props: Icontype) => <Feather name="terminal" {...props} />;

export default Feather;
