/* @flow strict-local */
import type { InputSelectionType } from '../types';

export default (textWhole: string, selection: InputSelectionType) => {
  /* This regular expression has 3 parts each divided by an or symbol. The first tries to match with : and it can have
     alphanumeric characters and @ after it. The second part is @, this part only matches @ if there are no words right
     before it because that would imply that it is an email. This gives a problem for strings such as '@ab' but that is
     taken care of later. Finally, the 3rd part has # which can have words or spaces or lines after it. The g flag helps
     iterate through all the matches.
  */
  // const myReg = /:[\w\s|@]*|[^\w][@][\w\s]*|[#][\w\s]*$/gm;
  const myReg = /:|[^\w]@|#$/gm;

  const { start, end } = selection;
  let text = textWhole;
  if (start === end && start !== text.length) {
    // new letter is typed in middle
    text = text.substring(0, start);
  }

  /*
    arrayofMatches will contain all the matches to the regular expression. Latest match is the last match in the arrayofMatches
    because that is what we want to autocomplete. Filter will give the part after the sigil(@,:,#) but some have higher 'priority'
    in a sense. If : is in the first index then choose it as sigil and take everything after it. The way we have defined @ in RegEx
    things like ' @ab' will result in match being ' @ab' so to remove the part left of @ we check if the second letter is @ and
    then take that as sigil and everything after it as filter. # works the same way as :.
  */
  const arrayOfMatches = text.match(myReg) != null ? text.match(myReg) : null;
  const latestMatch = arrayOfMatches != null ? arrayOfMatches[arrayOfMatches.length - 1] : null;
  let tempSigil = '';
  let filter = null;
  if (latestMatch != null) {
    if (latestMatch[0] === ':') {
      tempSigil = ':';
      const lastIndex = text.lastIndexOf(':');
      filter = text.substring(lastIndex + 1, text.length);
    } else if (latestMatch[1] === '@') {
      tempSigil = '@';
      filter = text.substring(text.lastIndexOf('@') + 1, text.length);
    } else {
      tempSigil = '#';
      filter = latestMatch.substring(1, latestMatch.length);
    }
  } else if (text[0] === '@') {
    // This case is if @ is in the beginning such as '@ab' our RegEx does not catch it because we have made it [^\w]
    tempSigil = '@';
    filter = text.substring(1, text.length);
  } else {
    // This is for no matches
    tempSigil = '';
    filter = '';
  }
  const sigil: string = tempSigil;

  return { sigil, filter };
};
