/* @flow */
import { KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';

export default (Platform.OS === 'ios' ? KeyboardAvoidingView : View);
