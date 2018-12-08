/* @flow */
import type {
  DraftImagesState,
  DraftImageAddAction,
  DraftImageRemoveAction,
  DraftImageUploadingAction,
  DraftImageUploadedAction,
  DraftImageErrorAction,
} from '../types';
import {
  DRAFT_IMAGE_ADD,
  DRAFT_IMAGE_REMOVE,
  DRAFT_IMAGE_UPLOADING,
  DRAFT_IMAGE_UPLOADED,
  DRAFT_IMAGE_ERROR,
  LOGOUT,
} from '../actionConstants';

const initialState = {};

const draftImageAdd = (state: DraftImagesState, action: DraftImageAddAction): DraftImagesState => {
  const { fileName, uri } = action;
  return { ...state, [action.id]: { fileName, uri } };
};

const draftImageRemove = (
  state: DraftImagesState,
  action: DraftImageRemoveAction,
): DraftImagesState => {
  const newState = {
    ...state,
  };
  delete newState[action.id];
  return newState;
};

const draftImageUploading = (
  state: DraftImagesState,
  action: DraftImageUploadingAction,
): DraftImagesState => {
  const newState = {
    ...state,
    [action.id]: {
      ...state[action.id],
      uploadStatus: 'uploading',
    },
  };
  return newState;
};

const draftImageUploaded = (
  state: DraftImagesState,
  action: DraftImageUploadedAction,
): DraftImagesState => {
  const newState = {
    ...state,
    [action.id]: {
      ...state[action.id],
      serverUri: action.serverUri,
      uploadStatus: 'uploaded',
    },
  };
  return newState;
};

const draftImageError = (
  state: DraftImagesState,
  action: DraftImageErrorAction,
): DraftImagesState => {
  const newState = {
    ...state,
    [action.id]: {
      ...state[action.id],
      uploadStatus: 'error',
    },
  };
  return newState;
};

export default (
  state: DraftImagesState = initialState,
  action: | DraftImageAddAction
    | DraftImageRemoveAction
    | DraftImageUploadingAction
    | DraftImageUploadedAction
    | DraftImageErrorAction,
): DraftImagesState => {
  switch (action.type) {
    case LOGOUT:
      return initialState;

    case DRAFT_IMAGE_ADD:
      return draftImageAdd(state, action);

    case DRAFT_IMAGE_REMOVE:
      return draftImageRemove(state, action);

    case DRAFT_IMAGE_UPLOADING:
      return draftImageUploading(state, action);

    case DRAFT_IMAGE_UPLOADED:
      return draftImageUploaded(state, action);

    case DRAFT_IMAGE_ERROR:
      return draftImageError(state, action);

    default:
      return state;
  }
};
