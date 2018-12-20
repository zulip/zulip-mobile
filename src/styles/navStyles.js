/* @flow strict-local */
import { BRAND_COLOR, NAVBAR_SIZE } from './constants';

export const statics = {
  navWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleAvatar: {
    marginRight: 16,
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
};

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
};

export default ({ color, backgroundColor, borderColor }: Props) => ({
  ...statics,
  navBar: {
    backgroundColor,
    borderColor,
    flexDirection: 'row',
    height: NAVBAR_SIZE,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
});
