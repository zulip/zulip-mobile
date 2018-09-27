/* @flow */
import deepFreeze from 'deep-freeze';
import draftImagesReducers from '../draftImagesReducers';
import {
  DRAFT_IMAGE_ADD,
  DRAFT_IMAGE_REMOVE,
  DRAFT_IMAGE_UPLOADING,
  DRAFT_IMAGE_UPLOADED,
  DRAFT_IMAGE_ERROR,
} from '../../actionConstants';

describe('draftImagesReducers', () => {
  describe(DRAFT_IMAGE_ADD, () => {
    test('add a new draft image', () => {
      const action = deepFreeze({
        type: DRAFT_IMAGE_ADD,
        id: '12345',
        fileName: 'testFileName',
        uri: 'path/to/file',
      });
      const expectedState = {
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
        },
      };
      const actualState = draftImagesReducers(undefined, action);
      expect(actualState).toEqual(expectedState);
    });
  });
  describe(DRAFT_IMAGE_REMOVE, () => {
    test('add a new draft image', () => {
      const initialState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
      };
      const action = deepFreeze({
        type: DRAFT_IMAGE_REMOVE,
        id: '12345',
      });
      const expectedState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
      };
      const actualState = draftImagesReducers(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });
  describe(DRAFT_IMAGE_UPLOADING, () => {
    test('add uploading state to draft image', () => {
      const initialState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
      };
      const action = deepFreeze({
        type: DRAFT_IMAGE_UPLOADING,
        id: '12345',
      });
      const expectedState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'uploading',
        },
      };
      const actualState = draftImagesReducers(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });
  describe(DRAFT_IMAGE_UPLOADED, () => {
    test('add uploading state to draft image', () => {
      const initialState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'uploading',
        },
      };
      const action = deepFreeze({
        type: DRAFT_IMAGE_UPLOADED,
        id: '12345',
      });
      const expectedState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'uploaded',
        },
      };
      const actualState = draftImagesReducers(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });
  describe(DRAFT_IMAGE_ERROR, () => {
    test('add error state to draft image', () => {
      const initialState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'uploading',
        },
      };
      const action = deepFreeze({
        type: DRAFT_IMAGE_ERROR,
        id: '12345',
      });
      const expectedState = {
        '45678': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'local'
        },
        '12345': {
          fileName: 'testFileName',
          uri: 'path/to/file',
          uploadStatus: 'error',
        },
      };
      const actualState = draftImagesReducers(initialState, action);
      expect(actualState).toEqual(expectedState);
    });
  });
});
