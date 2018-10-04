/* eslint-env node */

const fs = require('fs');

const babel = require('@babel/core');

const sourceFilename = 'src/webview/js/js.js';
const outputFilename = 'src/webview/js/generatedEs3.js';

const es3Code = babel.transformFileSync(sourceFilename, {
  compact: false,
}).code;

const output = `/*
 * This is a GENERATED file -- do not edit.
 * To make changes:
 *   1. Edit \`js.js\`, which is the source for this file.
 *   2. Run \`yarn run generate-webview-js\`.
 */

export default \`
'use strict';

${es3Code}
\`;
`;

fs.writeFileSync(outputFilename, output);
