import { CameraRoll, AlertIOS } from 'react-native';

export default (url: string) =>
  CameraRoll.saveToCameraRoll(url).then(() => AlertIOS.alert('Download complete', 'File saved to CameraRoll.'));
