/* @flow strict-local */
import { Alert } from 'react-native';
import Toast from '@remobile/react-native-toast';

export const showToast = (message: string) => {
  Toast.show(message, Toast.SHORT);
};

export const showErrorAlert = (message: string, title: string) =>
  Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }], { cancelable: true });

export const showErrorFromException = (error: Error, title: string) =>
  // $FlowFixMe
  Alert.alert(title, error && error.data && error.data.msg, [{ text: 'OK', onPress: () => {} }], {
    cancelable: true,
  });
