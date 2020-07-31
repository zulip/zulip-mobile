/* @flow strict-local */
import { Alert } from 'react-native';
import Toast from 'react-native-simple-toast';

export const showToast = (message: string) => {
  Toast.show(message);
};

export const showErrorAlert = (message?: string, title: string) =>
  Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }], { cancelable: true });
