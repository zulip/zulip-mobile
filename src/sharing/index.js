/* @flow strict-local */
import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import type { SharedData } from './types';
import { navigateToSharing } from '../actions';

const Sharing = NativeModules.Sharing ?? {
  readInitialSharedContent: () =>
    // TODO: Implement on iOS.
    null,
};

const goToSharing = (data: SharedData) => {
  NavigationService.dispatch(navigateToSharing(data));
};

export const handleInitialShare = async () => {
  const initialSharedData: SharedData | null = await Sharing.readInitialSharedContent();
  if (initialSharedData !== null) {
    goToSharing(initialSharedData);
  }
};

export class ShareReceivedListener {
  unsubs: Array<() => void> = [];

  /** Private. */
  listen(name: string, handler: (...empty) => void | Promise<void>) {
    if (Platform.OS === 'android') {
      const subscription = DeviceEventEmitter.addListener(name, handler);
      this.unsubs.push(() => subscription.remove());
    }
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  handleShareReceived: SharedData => void = data => {
    goToSharing(data);
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    if (Platform.OS === 'android') {
      this.listen('shareReceived', this.handleShareReceived);
    }
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}
