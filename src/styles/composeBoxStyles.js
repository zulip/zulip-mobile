/* @flow strict */

import { BRAND_COLOR } from './constants';

export default {
  composeMenu: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  expandButton: {
    padding: 12,
    color: BRAND_COLOR,
  },
  composeMenuButton: {
    padding: 12,
    marginRight: -8,
    color: BRAND_COLOR,
  },
  disabledComposeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'gray',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledComposeButton: {
    padding: 12,
  },
  disabledComposeText: {
    flex: 1,
    color: 'white',
  },
};
