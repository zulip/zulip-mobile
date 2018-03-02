/* @flow */

const OFFLINE_THRESHOLD_SECS = 140;

export const filterOutOutdatedPresence = (presences: Object) => {
  const temp = Object.keys(presences).reduce((map, email) => {
    if (
      presences[email].aggregated &&
      presences[email].aggregated.timestamp &&
      Date.now() / 1000 - presences[email].aggregated.timestamp < OFFLINE_THRESHOLD_SECS
    ) {
      map[email] = presences[email];
    }
    return map;
  }, {});
  return temp;
};
