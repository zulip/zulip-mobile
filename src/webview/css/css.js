/* @flow */
/* eslint-disable */
import { Platform } from 'react-native';

import type { ThemeType } from '../../types';
import { BORDER_COLOR, BRAND_COLOR } from '../../styles';
import cssEmojis from './cssEmojis';
import { getWebviewResource } from '../webviewHelpers';

export default (theme: ThemeType, highlightUnreadMessages: boolean) => `
<link type="text/css" href="${getWebviewResource('theme.css')}" rel="stylesheet" />
${
  theme === 'night'
    ? '<link type="text/css" href="${getWebviewResource(\'dark.css\')}" rel="stylesheet" />'
    : ''
}
<link type="text/css" href="${getWebviewResource('emoji.css')}" rel="stylesheet" />
<link type="text/css" href="${getWebviewResource('code.css')}" rel="stylesheet" />
<style>
${highlightUnreadMessages ? '.message:not([data-read="true"]) { background: red; }' : ''}
</style>
`;
