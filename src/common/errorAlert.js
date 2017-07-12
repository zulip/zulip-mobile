import { Alert } from 'react-native';

export const showErrorAlert = (message, title) => {
  Alert.alert(title, message, [{ text: 'OK', onPress: () => {} }], { cancelable: true });
};
