/* @flow */
import type {
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
} from '../actionConstants';

export const draftImageAdd = (id: string, fileName: string, uri: string): DraftImageAddAction => ({
  type: DRAFT_IMAGE_ADD,
  id,
  fileName,
  uri,
});

export const draftImageRemove = (id: string): DraftImageRemoveAction => ({
  type: DRAFT_IMAGE_REMOVE,
  id,
});

export const draftImageUploading = (id: string): DraftImageUploadingAction => ({
  type: DRAFT_IMAGE_UPLOADING,
  id,
});

export const draftImageUploaded = (id: string, serverUri: string): DraftImageUploadedAction => ({
  type: DRAFT_IMAGE_UPLOADED,
  id,
  serverUri,
});

export const draftImageError = (id: string): DraftImageErrorAction => ({
  type: DRAFT_IMAGE_ERROR,
  id,
});
