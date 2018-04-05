/* eslint-env node */

const fs = require('fs');
const babel = require('babel-core');

const sourceFilename = 'src/render-html/js.js';
const outputFilename = 'src/render-html/es3.js';

const es3Code = babel.transformFileSync(sourceFilename, {
    compact: false,
}).code;

const prefix = 'export default `\n\'use strict\';\n\n';
const suffix = '\n`;\n';

fs.writeFileSync(outputFilename, `${prefix}${es3Code}${suffix}`);
