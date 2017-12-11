/* @flow */
import type { Actions, ActionSheetButtonType } from '../types';

type ConstructActionButtonsType = {
  narrow: [],
};

type ExecuteActionSheetParams = {
  title: string,
  actions: Actions,
};

const actionSheetButtons: ActionSheetButtonType[] = [
  {
    title: 'Create group',
    onPress: ({ actions }) => {
      actions.navigateToCreateGroup();
    },
  },
  {
    title: 'Full screen editor',
    onPress: ({ actions, saveNewText, message }) => {
      actions.navigateToFullEditor(saveNewText, message);
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
