/* @flow */
import Snackbar from 'react-native-snackbar';

export const showSnackBar = (title: string) => {
  Snackbar.show({
    'backgroundColor': 'gray',
    'title': title,
    'duration': Snackbar.LENGTH_LONG,
  });
};
