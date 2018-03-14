/* @flow */
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import type { StyleObj } from '../types';

type IconType = {
  size?: number,
  color?: string,
  style?: StyleObj
};

export const IconHome = (props: IconType) => <Feather name="home" {...props} />;
export const IconStar = (props: IconType) => <Feather name="star" {...props} />;
export const IconMention = (props: IconType) => <Feather name="at-sign" {...props} />;
export const IconSearch = (props: IconType) => <Feather name="search" {...props} />;
export const IconDone = (props: IconType) => <Feather name="check" {...props} />;
export const IconCancel = (props: IconType) => <Feather name="slash" {...props} />;
export const IconTrash = (props: IconType) => <Feather name="trash-2" {...props} />;
export const IconWarning = (props: IconType) => <Feather name="alert-triangle" {...props} />;
export const IconSend = (props: IconType) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props: IconType) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props: IconType) => <Feather name="hash" {...props} />;
export const IconPrivate = (props: IconType) => <Feather name="lock" {...props} />;
export const IconPrivateChat = (props: IconType) => <Feather name="mail" {...props} />;
export const IconDownArrow = (props: IconType) => <Feather name="chevron-down" {...props} />;
export const IconGoogle = (props: IconType) => <IoniconsIcon name="logo-google" {...props} />;
export const IconGitHub = (props: IconType) => <Feather name="github" {...props} />;
export const IconCross = (props: IconType) => <Feather name="x" {...props} />;
export const IconSettings = (props: IconType) => <Feather name="settings" {...props} />;
export const IconRight = (props: IconType) => <Feather name="chevron-right" {...props} />;
export const IconPlus = (props: IconType) => <Feather name="plus-circle" {...props} />;
export const IconLeft = (props: IconType) => <Feather name="chevron-left" {...props} />;
export const IconPeople = (props: IconType) => <Feather name="users" {...props} />;
export const IconImage = (props: IconType) => <Feather name="image" {...props} />;
export const IconCamera = (props: IconType) => <Feather name="camera" {...props} />;
export const IconTerminal = (props: IconType) => <Feather name="terminal" {...props} />;

export default Feather;
