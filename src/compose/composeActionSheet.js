/* @flow */
import type { Actions, ActionSheetButtonType } from '../types';
import { isStreamNarrow } from '../utils/narrow';

type ConstructActionButtonsType = {
  narrow: [],
};

type ExecuteActionSheetParams = {
  title: string,
  actions: Actions,
};

const actionSheetButtons: ActionSheetButtonType[] = [
  {
    title: 'Toggle compose tools',
    onPress: ({ actions }) => actions.toggleComposeTools(),
    onlyIf: isStreamNarrow,
  },
  {
    title: 'Create group',
    onPress: ({ actions }) => {
      actions.navigateToCreateGroup();
    },
  },
];

export const constructActionButtons = ({ narrow }: ConstructActionButtonsType) => {
  const buttons = actionSheetButtons.filter(x => !x.onlyIf || x.onlyIf(narrow)).map(x => x.title);

  buttons.push('Cancel');
  return buttons;
};

export const executeActionSheetAction = ({ title, ...props }: ExecuteActionSheetParams) => {
  const button = actionSheetButtons.find(x => x.title === title);
  if (button) {
    button.onPress(props);
  }
};
