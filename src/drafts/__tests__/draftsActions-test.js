import mockStore from 'redux-mock-store'; // eslint-disable-line

import { updateDraft } from '../draftsActions';

global.fetch = jest.fn();

describe('updateDraft', () => {
  test('updating the draft with new text produces a DRAFT_ADD action', () => {
    const store = mockStore({});
    store.dispatch(updateDraft([], 'Hey'));
    const expectedAction = {
      type: 'DRAFT_ADD',
      narrow: [],
      content: 'Hey',
    };

    const actions = store.getActions();

    expect(actions[0]).toEqual(expectedAction);
  });

  test('updating the draft with no text produces a DRAFT_REMOVE action', () => {
    const store = mockStore({});
    store.dispatch(updateDraft([], ''));
    const expectedAction = {
      type: 'DRAFT_REMOVE',
      narrow: [],
    };

    const actions = store.getActions();

    expect(actions[0]).toEqual(expectedAction);
  });

  test('updating the draft with white space treats it as no text', () => {
    const store = mockStore({});
    store.dispatch(updateDraft([], '     '));
    const expectedAction = {
      type: 'DRAFT_REMOVE',
      narrow: [],
    };

    const actions = store.getActions();

    expect(actions[0]).toEqual(expectedAction);
  });
});
