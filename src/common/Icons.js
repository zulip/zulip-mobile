import React from 'react';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export const IconHome = (props) => <IoniconsIcon name="md-home" {...props} />;
export const IconPrivateMessage = (props) => <IoniconsIcon name="md-chatboxes" {...props} />;
export const IconStar = (props) => <IoniconsIcon name="md-star" {...props} />;
export const IconMention = (props) => <IoniconsIcon name="md-at" {...props} />;
export const IconSearch = (props) => <IoniconsIcon name="md-search" {...props} />;
export const IconDone = (props) => <MaterialIcon name="done" {...props} />;
export const IconCancel = (props) => <MaterialIcon name="cancel" {...props} />;
export const IconWarning = (props) => <MaterialIcon name="warning" {...props} />;
export const IconSend = (props) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props) => <FontAwesomeIcon name="hashtag" {...props} />;
export const IconPrivate = (props) => <FontAwesomeIcon name="lock" {...props} />;
export const IconPrivateChat = (props) => <IoniconsIcon name="md-text" {...props} />;
export const IconDownArrow = (props) => <IoniconsIcon name="md-arrow-down" {...props} />;

export default IoniconsIcon;
