import { PermissionsAndroid, Alert } from 'react-native'; // eslint-disable-line

export default async operation => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission required',
        message: 'Zulip needs access to your storage to save images.',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      operation();
    }
  } catch (err) {
    Alert.alert('Storage permission', 'Zulip requires access to photos.');
  }
};
