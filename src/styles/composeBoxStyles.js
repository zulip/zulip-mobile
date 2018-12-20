/* @flow strict-local */
import { Platform } from 'react-native';

import { BRAND_COLOR } from './';

const inputMarginPadding = {
  paddingHorizontal: 8,
  ...Platform.select({
    ios: {
      paddingVertical: 8,
    },
    android: {
      paddingVertical: 2,
    },
  }),
};

const statics = {
  composeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
  composeText: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  composeSendButton: {
    padding: 8,
  },
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
  composeTextInput: {
    borderWidth: 0,
    borderRadius: 5,
    fontSize: 15,
    ...inputMarginPadding,
  },
  topicInput: {
    borderWidth: 0,
    borderRadius: 5,
    marginBottom: 8,
    ...inputMarginPadding,
  },
};

export default statics;
