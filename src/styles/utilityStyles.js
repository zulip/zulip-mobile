/* @flow */
import type { Style } from '../types';
import { SPACING, HALF_SPACING } from './';

export type UtilityStyles = {
  padding: Style,
  paddingVertical: Style,
  paddingHorizontal: Style,
  paddingTop: Style,
  paddingBottom: Style,
  paddingLeft: Style,
  paddingRight: Style,
  halfPadding: Style,
  halfPaddingVertical: Style,
  halfPaddingHorizontal: Style,
  halfPaddingTop: Style,
  halfPaddingBottom: Style,
  halfPaddingLeft: Style,
  halfPaddingRight: Style,
  margin: Style,
  marginVertical: Style,
  marginHorizontal: Style,
  marginTop: Style,
  marginBottom: Style,
  marginLeft: Style,
  marginRight: Style,
  halfMargin: Style,
  halfMarginVertical: Style,
  halfMarginHorizontal: Style,
  halfMarginTop: Style,
  halfMarginBottom: Style,
  halfMarginLeft: Style,
  halfMarginRight: Style,
};

export default {
  // Padding
  padding: {
    padding: SPACING,
  },
  paddingVertical: {
    paddingVertical: SPACING,
  },
  paddingHorizontal: {
    paddingHorizontal: SPACING,
  },
  paddingTop: {
    paddingTop: SPACING,
  },
  paddingBottom: {
    paddingBottom: SPACING,
  },
  paddingLeft: {
    paddingLeft: SPACING,
  },
  paddingRight: {
    paddingRight: SPACING,
  },
  // Half padding
  halfPadding: {
    padding: HALF_SPACING,
  },
  halfPaddingVertical: {
    paddingVertical: HALF_SPACING,
  },
  halfPaddingHorizontal: {
    paddingHorizontal: HALF_SPACING,
  },
  halfPaddingTop: {
    paddingTop: HALF_SPACING,
  },
  halfPaddingBottom: {
    paddingBottom: HALF_SPACING,
  },
  halfPaddingLeft: {
    paddingLeft: HALF_SPACING,
  },
  halfPaddingRight: {
    paddingRight: HALF_SPACING,
  },
  // Margin
  margin: {
    margin: SPACING,
  },
  marginVertical: {
    marginVertical: SPACING,
  },
  marginHorizontal: {
    marginHorizontal: SPACING,
  },
  marginTop: {
    marginTop: SPACING,
  },
  marginBottom: {
    marginBottom: SPACING,
  },
  marginLeft: {
    marginLeft: SPACING,
  },
  marginRight: {
    marginRight: SPACING,
  },
  // Half margin
  halfMargin: {
    margin: HALF_SPACING,
  },
  halfMarginVertical: {
    marginVertical: HALF_SPACING,
  },
  halfMarginHorizontal: {
    marginHorizontal: HALF_SPACING,
  },
  halfMarginTop: {
    marginTop: HALF_SPACING,
  },
  halfMarginBottom: {
    marginBottom: HALF_SPACING,
  },
  halfMarginLeft: {
    marginLeft: HALF_SPACING,
  },
  halfMarginRight: {
    marginRight: HALF_SPACING,
  },
};
