/* @flow strict-local */
import type { Narrow, Dispatch, GetState } from '../types';
import { getAuth, getUsers, isNarrowValid, getIsHydrated } from '../selectors';
import { DO_NARROW } from '../actionConstants';
import { getMessageIdFromLink, getNarrowFromLink, isUrlInAppLink, getFullUrl } from '../utils/url';
import openLink from '../utils/openLink';
import { fetchMessagesInNarrow } from './fetchActions';
import { navigateToChat } from '../nav/navActions';
import { FIRST_UNREAD_ANCHOR } from '../constants';

export const doNarrow = (narrow: Narrow, anchor: number = FIRST_UNREAD_ANCHOR) => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isNarrowValid(narrow)(state) || !getIsHydrated(state)) {
    return;
  }

  dispatch({ type: DO_NARROW, narrow });
  dispatch(fetchMessagesInNarrow(narrow, anchor));
  dispatch(navigateToChat(narrow));
};

export const messageLinkPress = (href: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const auth = getAuth(state);

  if (isUrlInAppLink(href, auth.realm)) {
    const users = getUsers(state);
    const anchor = getMessageIdFromLink(href, auth.realm);
    const narrow = getNarrowFromLink(href, auth.realm, users);

    dispatch(doNarrow(narrow, anchor));
  } else {
    let url = getFullUrl(href, auth.realm);
    if (url.startsWith(auth.realm)) {
      // get the AWS resource file path and open it in browser
      const srcPath = url.substring(auth.realm.length);
      if (
        srcPath.startsWith('/user_uploads/')
        || srcPath.startsWith('/thumbnail?')
        || srcPath.startsWith('/avatar/')
      ) {
        const delimiter = url.includes('?') ? '&' : '?';
        url += `${delimiter}api_key=${auth.apiKey}`;

        const response = await fetch(url);
        openLink(response.url);
        return;
      }
    }
    openLink(getFullUrl(url, auth.realm));
  }
};
