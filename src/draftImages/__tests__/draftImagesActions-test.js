import mockStore from 'redux-mock-store'; // eslint-disable-line

import {
  draftImageAdd,
  draftImageRemove,
  draftImageUploading,
  draftImageUploaded,
  draftImageError,
} from '../draftImagesActions';

global.fetch = jest.fn();

describe('add draft image', () => {
  test('adding a draft image with DRAFT_IMAGE_ADD', () => {
    const store = mockStore({
      draftImages: {},
    });
    store.dispatch(draftImageAdd('12345', 'testFileName', 'path/to/file'));
    const expectedAction = {
      type: 'DRAFT_IMAGE_ADD',
      id: '12345',
      fileName: 'testFileName',
      uri: 'path/to/file',
    };

    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedAction);
  });
  test('removing a draft image with DRAFT_IMAGE_REMOVE', () => {
    const store = mockStore({
      draftImages: {
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
        },
      },
    });
    store.dispatch(draftImageRemove('12345'));
    const expectedAction = {
      type: 'DRAFT_IMAGE_REMOVE',
      id: '12345',
    };

    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedAction);
  });
  test('uploading state for draft image with DRAFT_IMAGE_UPLOADING', () => {
    const store = mockStore({
      draftImages: {
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
        },
      },
    });
    store.dispatch(draftImageUploading('12345'));
    const expectedAction = {
      type: 'DRAFT_IMAGE_UPLOADING',
      id: '12345',
    };

    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedAction);
  });
  test('uploaded state for draft image with DRAFT_IMAGE_UPLOADED', () => {
    const store = mockStore({
      draftImages: {
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
        },
      },
    });
    store.dispatch(draftImageUploaded('12345', 'path/to/file'));
    const expectedAction = {
      type: 'DRAFT_IMAGE_UPLOADED',
      id: '12345',
      serverUri: 'path/to/file',
    };

    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedAction);
  });
  test('error state for draft image with DRAFT_IMAGE_ERROR', () => {
    const store = mockStore({
      draftImages: {
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
        },
      },
    });
    store.dispatch(draftImageError('12345'));
    const expectedAction = {
      type: 'DRAFT_IMAGE_ERROR',
      id: '12345',
    };

    const actions = store.getActions();
    expect(actions[0]).toEqual(expectedAction);
  });
});
