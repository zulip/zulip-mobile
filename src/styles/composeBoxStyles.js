/* @flow */
import { Platform } from 'react-native';

import { HALF_SPACING, SPACING } from './';

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
};

const inputMarginPadding = {
  marginLeft: HALF_SPACING,
  marginRight: HALF_SPACING,
  paddingHorizontal: HALF_SPACING,
  ...Platform.select({
    ios: {
      paddingVertical: HALF_SPACING,
    },
    android: {
      paddingVertical: HALF_SPACING / 2,
    },
  }),
};

export default ({ color, backgroundColor, borderColor }: Props) => ({
  composeBox: {
    padding: HALF_SPACING,
    flexDirection: 'row',
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
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
    marginBottom: HALF_SPACING,
    ...inputMarginPadding,
  },
  composeText: {
    flex: 1,
    justifyContent: 'center',
  },
});
