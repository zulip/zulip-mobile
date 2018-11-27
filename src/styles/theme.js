/* @flow strict-local */
import type { UtilityStyles } from './utilityStyles';
import type { ComposeBoxStyles } from './composeBoxStyles';
import type { NavStyles } from './navStyles';
import type { MiscStyles } from './miscStyles';
import utilityStyles from './utilityStyles';
import composeBoxStyles from './composeBoxStyles';
import navStyles from './navStyles';
import miscStyles from './miscStyles';

export type AppStyles = UtilityStyles & ComposeBoxStyles & NavStyles & MiscStyles;

type Props = {
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
};

export default (props: Props) => ({
  ...utilityStyles,
  ...composeBoxStyles(props),
  ...navStyles(props),
  ...miscStyles(props),
});
