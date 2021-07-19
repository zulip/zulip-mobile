/* @flow strict-local */
import { Alert } from 'react-native';
import Toast from 'react-native-simple-toast';

export const showToast = (message: string) => {
  Toast.show(message);
};

export const showErrorAlert = (title: string, message?: string): void =>
  Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }], { cancelable: true });
