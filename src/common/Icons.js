/* @flow */
import React from 'react';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import EntypoIcon from 'react-native-vector-icons/Entypo';

export const IconHome = (props: Object) => <IoniconsIcon name="md-home" {...props} />;
export const IconPrivateMessage = (props: Object) =>
  <IoniconsIcon name="md-chatboxes" {...props} />;
export const IconStar = (props: Object) => <IoniconsIcon name="md-star" {...props} />;
export const IconMention = (props: Object) => <IoniconsIcon name="md-at" {...props} />;
export const IconSearch = (props: Object) => <IoniconsIcon name="md-search" {...props} />;
export const IconDone = (props: Object) => <MaterialIcon name="done" {...props} />;
export const IconCancel = (props: Object) => <MaterialIcon name="cancel" {...props} />;
export const IconWarning = (props: Object) => <MaterialIcon name="warning" {...props} />;
export const IconSend = (props: Object) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props: Object) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props: Object) => <FontAwesomeIcon name="hashtag" {...props} />;
export const IconPrivate = (props: Object) => <FontAwesomeIcon name="lock" {...props} />;
export const IconPrivateChat = (props: Object) => <IoniconsIcon name="md-mail" {...props} />;
export const IconDownArrow = (props: Object) => <IoniconsIcon name="md-arrow-down" {...props} />;
export const IconGoogle = (props: Object) => <IoniconsIcon name="logo-google" {...props} />;
export const IconCross = (props: Object) => <EntypoIcon name="cross" {...props} />;

export default IoniconsIcon;
