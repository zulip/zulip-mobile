/* @flow */
import type { Style } from '../types';
import { BRAND_COLOR, HALF_SPACING, NAVBAR_SIZE, SPACING } from './';

export type NavStyles = {
  navBar: Style,
  navWrapper: Style,
  subheader: Style,
  titleAvatar: Style,
  navSubtitle: Style,
  navTitle: Style,
  titleStreamWrapper: Style,
  titleStreamRow: Style,
  activityText: Style,
  navButtonFrame: Style,
  navButtonIcon: Style,
};

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
};

export default ({ color, backgroundColor, borderColor }: Props) => ({
  navBar: {
    backgroundColor,
    borderColor,
    flexDirection: 'row',
    height: NAVBAR_SIZE,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  subheader: {
    flex: 1,
    flexBasis: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleAvatar: {
    marginRight: SPACING,
  },
  navSubtitle: {
    fontSize: 13,
  },
  navTitle: {
    color: BRAND_COLOR,
    textAlign: 'left',
    fontSize: 20,
  },
  titleStreamWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleStreamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 13,
    paddingLeft: HALF_SPACING,
  },
  navButtonFrame: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonIcon: {
    textAlign: 'center',
    fontSize: 26,
  },
});
