/* @flow */
import { Platform } from 'react-native';

import type { Style } from '../types';
import { BRAND_COLOR } from './';

export type ComposeBoxStyles = {
  composeBox: Style,
  composeText: Style,
  composeTextInput: Style,
  topicInput: Style,
  composeSendButton: Style,
  composeMenu: Style,
  expandButton: Style,
  composeMenuButton: Style,
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
  },
  composeText: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  composeTextInput: {
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
    margin: 8,
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
  composeBoxPreview: {
    flex: 1,
  },
  composeBoxPreviewContainer: {
    minHeight: 150,
  },
});
