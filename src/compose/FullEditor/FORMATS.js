import applyWrapFormat from './applyWrapFormat';
import applyWrapFormatNewLines from './applyWrapFormatNewLines';
import applyListFormat from './applyListFormat';
import applyWebLinkFormat from './applyWebLinkFormat';

export default [
  { key: 'B', wrapper: '**', onPress: applyWrapFormat, icon: 'bold' },
  { key: 'I', wrapper: '*', onPress: applyWrapFormat, icon: 'italic' },
  { key: 'U', wrapper: '_', onPress: applyWrapFormat, icon: 'underline' },
  { key: 'S', wrapper: '~~', onPress: applyWrapFormat, icon: 'minus' },
  { key: 'C', wrapper: '`', onPress: applyWrapFormat, icon: 'hash' },
  { key: 'CC', wrapper: '```', onPress: applyWrapFormatNewLines, icon: 'hash' },
  { key: 'L', prefix: '*', onPress: applyListFormat, icon: 'list' },
  { key: 'WEB', onPress: applyWebLinkFormat, icon: 'link' },
];
