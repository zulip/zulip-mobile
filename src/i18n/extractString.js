/* @flow */
import messages from './messages';

export default (locale: string, value: Object): string => messages[locale][value];
