/* @flow */
import { createSelector } from 'reselect';

import { getDraftImages } from '../directSelectors';

export const getDraftImageData = createSelector(getDraftImages, draftImages => draftImages || {});
