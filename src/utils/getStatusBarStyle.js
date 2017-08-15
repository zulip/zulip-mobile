/* @flow */
import { isStreamOrTopicNarrow } from '../utils/narrow';
import type { Narrow, StatusBarStyle, ThemeType } from '../types';

export default (narrow: Narrow, textColor: string, theme: ThemeType): StatusBarStyle =>
  textColor === 'white' && ((narrow && isStreamOrTopicNarrow(narrow)) || theme === 'night')
    ? 'light-content'
    : 'dark-content';
