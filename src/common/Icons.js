/* @flow */
import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export const IconHome = (props: Object) => <Feather name="home" {...props} />;
export const IconStar = (props: Object) => <Feather name="star" {...props} />;
export const IconMention = (props: Object) => <Feather name="at-sign" {...props} />;
export const IconSearch = (props: Object) => <Feather name="search" {...props} />;
export const IconDone = (props: Object) => <Feather name="check" {...props} />;
export const IconCancel = (props: Object) => <Feather name="slash" {...props} />;
export const IconTrash = (props: Object) => <Feather name="trash-2" {...props} />;
export const IconWarning = (props: Object) => <Feather name="alert-triangle" {...props} />;
export const IconSend = (props: Object) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props: Object) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props: Object) => <Feather name="hash" {...props} />;
export const IconPrivate = (props: Object) => <Feather name="lock" {...props} />;
export const IconPrivateChat = (props: Object) => <Feather name="mail" {...props} />;
export const IconDownArrow = (props: Object) => <Feather name="chevron-down" {...props} />;
export const IconGoogle = (props: Object) => <IoniconsIcon name="logo-google" {...props} />;
export const IconGitHub = (props: Object) => <Feather name="github" {...props} />;
export const IconCross = (props: Object) => <Feather name="x" {...props} />;
export const IconSettings = (props: Object) => <Feather name="settings" {...props} />;
export const IconRight = (props: Object) => <Feather name="chevron-right" {...props} />;
export const IconPlus = (props: Object) => <Feather name="plus-circle" {...props} />;
export const IconLeft = (props: Object) => <Feather name="chevron-left" {...props} />;
export const IconPeople = (props: Object) => <Feather name="users" {...props} />;
export const IconImage = (props: Object) => <Feather name="image" {...props} />;
export const IconCamera = (props: Object) => <Feather name="camera" {...props} />;

export default Feather;
