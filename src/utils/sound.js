/* @flow strict-local */
// $FlowFixMe[untyped-import]
import Sound from 'react-native-sound';
import * as logging from './logging';

if (Sound && Sound.setCategory) {
  Sound.setCategory('Ambient', true);
}

const messageSound = new Sound('zulip.mp3', Sound.MAIN_BUNDLE, (error: Error) => {
  if (error) {
    logging.error(error);
  }
});

export const playMessageSound = () => messageSound.play();
