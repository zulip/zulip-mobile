/* @flow */
/* eslint-disable */
import { Platform } from 'react-native';

import type { ThemeType } from '../../types';
import { BORDER_COLOR, BRAND_COLOR } from '../../styles';
import cssEmojis from './cssEmojis';
import { getWebviewResource } from '../webviewHelpers';

export default (highlightUnreadMessages: boolean): string => `
<link type="text/css" href="${getWebviewResource('theme.css')}" rel="stylesheet" />
<link type="text/css" href="${getWebviewResource('dark.css')}" rel="stylesheet" />
<link type="text/css" href="${getWebviewResource('emoji.css')}" rel="stylesheet" />
<link type="text/css" href="${getWebviewResource('code.css')}" rel="stylesheet" />
<link type="text/css" href="${getWebviewResource('katex.css')}" rel="stylesheet" />
<style>
${highlightUnreadMessages ? '.message:not([data-read="true"]) { background: red; }' : ''}
</style>
`;
