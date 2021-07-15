/* @flow strict-local */
import { Linking } from 'react-native';
import * as webAuth from '../start/webAuth';
import type { Dispatch, LinkingEvent } from '../types';
import { navigateViaDeepLink } from './urlActions';

const handleUrl = (url: URL, dispatch: Dispatch) => {
  switch (url.hostname) {
    case 'login':
      webAuth.endWebAuth({ url: url.toString() }, dispatch);
      break;
    default:
      dispatch(navigateViaDeepLink(url));
  }
};

export const handleInitialUrl = async (dispatch: Dispatch) => {
  const initialUrl: ?string = await Linking.getInitialURL();
  if (initialUrl != null) {
    handleUrl(new URL(initialUrl), dispatch);
  }
};

export class UrlListener {
  dispatch: Dispatch;
  unsubs: Array<() => void> = [];

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /** Private. */
  handleUrlEvent(event: LinkingEvent) {
    handleUrl(new URL(event.url), this.dispatch);
  }

  /** Private. */
  listen(handler: (event: LinkingEvent) => void | Promise<void>) {
    Linking.addEventListener('url', handler);
    this.unsubs.push(() => Linking.removeEventListener('url', handler));
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    this.listen((event: LinkingEvent) => this.handleUrlEvent(event));
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}
