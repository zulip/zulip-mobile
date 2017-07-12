/* @flow */
import emojiMap from './emojiMap';

export default (query: string) => Object.keys(emojiMap).filter(x => x.indexOf(query) === 0).sort();
