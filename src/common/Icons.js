import React from 'react';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

export const IconDone = (props) => <MaterialIcon name="done" {...props} />;
export const IconWarning = (props) => <MaterialIcon name="warning" {...props} />;
export const IconSend = (props) => <MaterialIcon name="send" {...props} />;
export const IconMute = (props) => <MaterialIcon name="volume-off" {...props} />;
export const IconStream = (props) => <FontAwesomeIcon name="hashtag" {...props} />;
export const IconPrivate = (props) => <FontAwesomeIcon name="lock" {...props} />;
export const IconPrivateChat = (props) => <IoniconsIcon name="md-text" {...props} />;

export default IoniconsIcon;
