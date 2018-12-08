/* @flow strict-local */
import { Platform } from 'react-native';

import type { Style } from '../types';
import { BRAND_COLOR } from './';

export type ComposeBoxStyles = {
  composeBox: Style,
  composeImage: Style,
  composeImages: Style,
  composeImageDeleteButton: Style,
  composeImageContainer: Style,
  composeText: Style,
  composeTextInput: Style,
  topicInput: Style,
  composeSendButton: Style,
  composeMenu: Style,
  expandButton: Style,
  composeMenuButton: Style,
  disabledComposeBox: Style,
  disabledComposeButton: Style,
  disabledComposeText: Style,
};

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
};

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

export default ({ color, backgroundColor, borderColor }: Props) => ({
  composeBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
    flexShrink: 1,
  },
  composeText: {
    flexGrow: 1,
    flexShrink: 1,
    paddingVertical: 8,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  composeImage: {
    flex: 1,
  },
  composeImageDeleteButton: {
    position: 'absolute',
    top: 3,
    right: 3,
    zIndex: 1,
  },
  composeImageContainer: {
    minWidth: 90,
    height: 90,
    margin: 5,
  },
  composeTextInput: {
    flexGrow: 0,
    flexShrink: 1,
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor,
    color,
    fontSize: 15,
    ...inputMarginPadding,
  },
  topicInput: {
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor,
    marginBottom: 8,
    ...inputMarginPadding,
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
});
