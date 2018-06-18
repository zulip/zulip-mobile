/* @flow */
import template from './template';
import type { ThemeType } from '../../types';
import css from '../css/css';
import htmlBody from './htmlBody';
import script from '../js/script';

type InitOptionsType = {
  anchor: number,
  highlightUnreadMessages: boolean,
  showMessagePlaceholders: boolean,
};

export default (content: string, theme: ThemeType, initOptions: InitOptionsType) => template`
$!${css(initOptions.highlightUnreadMessages)}
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<body style="overflow-x: hidden;" $!${theme === 'night' ? 'class="night-mode"' : ''}>
$!${htmlBody(content, initOptions.showMessagePlaceholders)}
</body>
$!${script(initOptions.anchor)}
`;
