/* @flow strict-local */
import type { ThemeColors } from './theme';
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
  navBar: {
    borderColor: 'rgba(127, 127, 127, 0.25)',
    flexDirection: 'row',
    height: NAVBAR_SIZE,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
};

export default ({ backgroundColor }: ThemeColors) => ({
  navBar: {
    ...statics.navBar,
    backgroundColor,
  },
});
