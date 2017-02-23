import differenceInSeconds from 'date-fns/difference_in_seconds';

import { Auth } from '../types';
import { focusPing } from '../api';

const APP_ACTIVITY_UPDATE_FREQUENCY = 60;
const USER_INPUT_ACTIVITY_UPDATE_FREQUENCY = 5;

let lastAppActivity = new Date();
let lastInputActivity = new Date();

export const registerAppActivity = (auth: Auth, hasFocus = true) => {
  if (differenceInSeconds(new Date(), lastAppActivity) > APP_ACTIVITY_UPDATE_FREQUENCY) {
    focusPing(auth, hasFocus, false);
    lastAppActivity = new Date();
  }
};

export const registerUserInputActivity = (auth: Auth) => {
  if (differenceInSeconds(new Date(), lastInputActivity) > USER_INPUT_ACTIVITY_UPDATE_FREQUENCY) {
    focusPing(auth, true, true);
    lastInputActivity = new Date();
  }
};
