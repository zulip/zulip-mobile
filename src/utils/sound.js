import Sound from 'react-native-sound';

const messageSound = new Sound('zulip.mp3', Sound.MAIN_BUNDLE, error => {
  if (error) {
    console.error('Failed to load the sound', error); // eslint-disable-line
  }
});

export const playMessageSound = () => messageSound.play();
