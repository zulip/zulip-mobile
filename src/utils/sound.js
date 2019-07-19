/* @flow strict-local */
import Sound from 'react-native-sound';
import { logErrorRemotely } from './logging';

if (Sound && Sound.setCategory) {
  Sound.setCategory('Ambient', true);
}

const messageSound = new Sound('zulip.mp3', Sound.MAIN_BUNDLE, (error: Error) => {
  if (error) {
    logErrorRemotely(error, 'Failed to load the sound');
  }
});

export const playMessageSound = () => messageSound.play();
