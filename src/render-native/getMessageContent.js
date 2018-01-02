/* @flow */
export default (html: string): string => {
  if (html.indexOf('<pre>') === -1) return html;
  const array = html.split('<pre>');
  let finalContent = '';
  for (let i = 0; i < array.length; i++) {
    if (i === 0) {
      finalContent = `${array[0]}<pre>`;
    } else {
      const secondArray = array[i].split('</pre>');
      finalContent = `${finalContent}${secondArray[0]
        .replace(/\r\n/g, '<br />')
        .replace(/[\r\n]/g, '<br />')}</pre>${secondArray[1]}`;
      if (i !== array.length - 1) finalContent = `${finalContent}<pre>`;
    }
  }
  return finalContent;
};
