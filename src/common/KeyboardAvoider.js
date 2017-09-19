/* @flow */
import { KeyboardAvoidingView, Platform, View } from 'react-native';

export default (Platform.OS === 'ios' ? KeyboardAvoidingView : View);
