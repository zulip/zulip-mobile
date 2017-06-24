import Snackbar from 'react-native-snackbar';

export const showSnackBar = (title, actionTitle, onPress) => {
  Snackbar.show({
    'backgroundColor': 'gray',
    'title': title,
    'duration': Snackbar.LENGTH_LONG,
    'action': {
      'title': actionTitle,
      'color': 'white',
      'onPress': onPress,
    },
  });
};
